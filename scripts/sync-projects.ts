/**
 * Weekly project sync (run by .github/workflows/sync-projects.yml).
 *
 * 1. Lists my public GitHub repositories.
 * 2. For a new repository, or one whose README changed, asks an LLM (Anthropic API) to write
 *    the project card in English and French from the README alone.
 * 3. Writes src/data/projects.json (validated) and a Markdown summary that
 *    becomes the pull request description. Nothing goes live until I merge.
 *
 * Env: ANTHROPIC_API_KEY (required when there is text to write),
 *      GITHUB_TOKEN (optional, raises the GitHub rate limit),
 *      SYNC_SUMMARY (optional path for the Markdown summary).
 */
import { readFile, writeFile } from 'node:fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { Category, Localized, Projects, type Project } from '../src/lib/schema.ts';
import {
  applyAction,
  planSync,
  type GeneratedText,
  type ReadmeInfo,
  type RepoInfo,
} from '../src/lib/sync.ts';

const OWNER = 'Polluxgnr';
const DATA = 'src/data/projects.json';
const MODEL = 'claude-opus-5-5';
const README_LIMIT = 60_000;

async function github<T>(path: string, accept = 'application/vnd.github+json'): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'polluxgronier.me-project-sync',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

async function readme(repo: string): Promise<ReadmeInfo | undefined> {
  const meta = await github<{ sha: string; content: string; encoding: string }>(
    `/repos/${OWNER}/${repo}/readme`,
  );
  if (!meta) return undefined;
  const text = Buffer.from(meta.content, meta.encoding === 'base64' ? 'base64' : 'utf8').toString(
    'utf8',
  );
  return { sha: meta.sha, text };
}

function generatedSchema(skills: readonly string[]) {
  return z.object({
    title: z
      .string()
      .describe('Short human title, not the repo slug. Keep an existing title unless it is wrong.'),
    question: Localized.describe('The question the project answers, in first person when natural.'),
    summary: Localized.describe(
      'Two or three plain sentences: what it does, how, and one concrete number if the README gives one.',
    ),
    why: Localized.describe(
      'Why the project exists, in two or three sentences, using only the README. If it gives no reason, state the goal it sets itself. Never invent a personal motive.',
    ),
    architecture: z
      .array(z.object({ title: Localized, detail: Localized }))
      .min(3)
      .max(6)
      .describe(
        'How it works as 3 to 6 ordered steps (a short title and one sentence each), taken from the README’s own description of its pipeline, data flow or method.',
      ),
    highlights: z
      .array(Localized)
      .max(3)
      .describe(
        'Up to three specific technical points worth a recruiter’s attention. Empty if the README is thin.',
      ),
    stack: z
      .array(z.string())
      .max(8)
      .describe('Tools and libraries named in the README, as written there.'),
    skills: z
      .array(z.enum(skills as [string, ...string[]]))
      .min(1)
      .max(4),
    category: Category,
  });
}

const SYSTEM = `You write project cards for the portfolio site of Pollux Gronier, an AI and data science student at CentraleSupélec and ESSEC. Recruiters read them.

Rules:
- Use only facts stated in the README. Never invent numbers, results, users or tools. If the README is thin, write less.
- Plain, specific language. No hype words (cutting-edge, powerful, seamless, leverage, robust, innovative), no exclamation marks.
- The question is what the project set out to answer, phrased the way Pollux would ask it.
- The French is natural French written for a French reader, not a word-for-word translation. Use French typographic spacing before ? ! : ;.
- Match the tone and length of the example cards.`;

async function generate(
  client: Anthropic,
  repo: RepoInfo,
  readmeText: string,
  examples: readonly Project[],
  skills: readonly string[],
  current?: Project,
): Promise<GeneratedText> {
  const truncated = readmeText.length > README_LIMIT;
  if (truncated)
    console.warn(
      `README of ${repo.name} is ${readmeText.length} chars; sending the first ${README_LIMIT}.`,
    );
  const exampleCards = examples.map(
    ({ title, question, summary, why, architecture, highlights, stack, skills: s, category }) => ({
      title,
      question,
      summary,
      why,
      architecture,
      highlights,
      stack,
      skills: s,
      category,
    }),
  );

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(generatedSchema(skills)) },
    system: [{ type: 'text', text: SYSTEM }],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Example cards, for tone and length:\n${JSON.stringify(exampleCards, null, 2)}`,
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text: [
              `Repository: ${OWNER}/${repo.name}`,
              repo.description ? `GitHub description: ${repo.description}` : '',
              current
                ? `Current card (update it to match the new README):\n${JSON.stringify(current, null, 2)}`
                : '',
              `README${truncated ? ' (truncated)' : ''}:\n<readme>\n${readmeText.slice(0, README_LIMIT)}\n</readme>`,
            ]
              .filter(Boolean)
              .join('\n\n'),
          },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal')
    throw new Error(`The model declined to write ${repo.name}.`);
  if (response.stop_reason === 'max_tokens')
    throw new Error(`Output for ${repo.name} was cut off.`);
  if (!response.parsed_output) throw new Error(`No valid card for ${repo.name}.`);
  return response.parsed_output;
}

async function main() {
  const current = Projects.parse(JSON.parse(await readFile(DATA, 'utf8')));
  const repos = (await github<RepoInfo[]>(`/users/${OWNER}/repos?per_page=100&type=owner`)) ?? [];

  // Fetch READMEs once; their SHA decides what needs rewriting.
  const readmes = new Map<string, ReadmeInfo>();
  for (const repo of repos) {
    const r = await readme(repo.name);
    if (r) readmes.set(repo.name, r);
  }

  const plan = planSync(current, repos, (name) => readmes.get(name)?.sha);
  const skills = [...new Set(current.flatMap((p) => p.skills))].sort();
  const examples = current.filter((p) => p.featured).slice(0, 3);
  // Created lazily so a run with nothing to write needs no API key.
  let client: Anthropic | undefined;

  const summary: string[] = [];
  let nextOrder = Math.max(0, ...current.map((p) => p.order)) + 1;
  const next: Project[] = [];

  for (const action of plan.actions) {
    const r = readmes.get(action.repo.name);
    if (action.kind === 'refresh') {
      next.push(applyAction(action, undefined, r?.sha, 0));
      continue;
    }
    if (!r) {
      summary.push(`- Skipped **${action.repo.name}**: no README to write from.`);
      if (action.kind === 'rewrite') next.push(action.current);
      continue;
    }
    let text: GeneratedText;
    try {
      client ??= new Anthropic();
      text = await generate(
        client,
        action.repo,
        r.text,
        examples,
        skills,
        action.kind === 'rewrite' ? action.current : undefined,
      );
    } catch (error) {
      // One failing repository should not block the others; keep its current card.
      const reason =
        error instanceof Anthropic.APIError ? `API error ${error.status}` : String(error);
      summary.push(`- Could not write **${action.repo.name}** (${reason}); kept as it was.`);
      if (action.kind === 'rewrite') next.push(action.current);
      continue;
    }
    next.push(applyAction(action, text, r.sha, nextOrder));
    if (action.kind === 'create') nextOrder++;
    summary.push(
      `- ${action.kind === 'create' ? 'Added' : 'Rewrote'} **${text.title}** (\`${action.repo.name}\`): ${text.question.en}`,
    );
  }
  for (const p of plan.removed)
    summary.push(`- Removed **${p.title}**: the repository is no longer public or listed.`);

  const validated = Projects.parse(next.toSorted((a, b) => a.order - b.order));
  await writeFile(DATA, `${JSON.stringify(validated, null, 2)}\n`);

  const body = summary.length
    ? `The weekly sync found changes in my GitHub repositories. Each card was written by an AI model from the repository README; check the wording before merging.\n\n${summary.join('\n')}`
    : 'No project text changed; only dates and links were refreshed.';
  if (process.env.SYNC_SUMMARY) await writeFile(process.env.SYNC_SUMMARY, `${body}\n`);
  console.log(body);
}

await main();
