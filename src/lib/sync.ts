/**
 * Decides what the weekly project sync should do, without any I/O, so the
 * rules are unit-tested: which repositories are new, which need their text
 * rewritten, which only need fresh metadata, and which disappeared.
 */
import type { Project } from './schema.ts';

export interface RepoInfo {
  name: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  /** ISO timestamp from the GitHub API. */
  pushed_at: string;
  homepage: string | null;
  description: string | null;
}

export interface ReadmeInfo {
  sha: string;
  text: string;
}

/** Repositories that are coursework labs or not projects at all. */
export const EXCLUDED_REPOS = new Set([
  'Polluxgnr',
  'Personal_website',
  'lab2',
  'lab3',
  'Lab_4',
  'lab5',
  'Td-OOP',
  'Space-invaders',
]);

export type SyncAction =
  | { kind: 'create'; repo: RepoInfo }
  | { kind: 'rewrite'; repo: RepoInfo; current: Project }
  | { kind: 'refresh'; repo: RepoInfo; current: Project };

export interface SyncPlan {
  actions: SyncAction[];
  /** Entries whose repository is gone, private or excluded. */
  removed: Project[];
}

export const isListed = (r: RepoInfo) =>
  !r.private && !r.fork && !r.archived && !EXCLUDED_REPOS.has(r.name);

/**
 * `readmeShaOf` returns the current README blob SHA of a repository, or
 * undefined when it has no README. A project's text is rewritten only when
 * its README changed and nobody locked it.
 */
export function planSync(
  current: readonly Project[],
  repos: readonly RepoInfo[],
  readmeShaOf: (repo: string) => string | undefined,
): SyncPlan {
  const listed = repos.filter(isListed);
  const byRepo = new Map(current.map((p) => [p.repo, p]));
  const names = new Set(listed.map((r) => r.name));

  const actions: SyncAction[] = listed.map((repo) => {
    const existing = byRepo.get(repo.name);
    if (!existing) return { kind: 'create', repo };
    const sha = readmeShaOf(repo.name);
    // Entries with no recorded README (written by hand) are adopted as they are:
    // their SHA is recorded now, and only a later README change triggers a rewrite.
    const readmeChanged =
      sha !== undefined && existing.readmeSha !== undefined && sha !== existing.readmeSha;
    return !existing.locked && readmeChanged
      ? { kind: 'rewrite', repo, current: existing }
      : { kind: 'refresh', repo, current: existing };
  });

  return { actions, removed: current.filter((p) => !names.has(p.repo)) };
}

/** Text fields the model writes. Everything else is decided by code or by hand. */
export interface GeneratedText {
  title: string;
  question: Project['question'];
  summary: Project['summary'];
  why?: Project['why'];
  architecture?: Project['architecture'];
  highlights: Project['highlights'];
  stack: string[];
  skills: string[];
  category: Project['category'];
}

export function applyAction(
  action: SyncAction,
  generated: GeneratedText | undefined,
  readmeSha: string | undefined,
  nextOrder: number,
): Project {
  const meta = {
    pushedAt: action.repo.pushed_at.slice(0, 10),
    ...(action.repo.homepage ? { homepage: action.repo.homepage } : {}),
  };

  if (action.kind === 'refresh') {
    const adopt = readmeSha && !action.current.readmeSha ? { readmeSha } : {};
    return { ...action.current, ...meta, ...adopt };
  }
  if (!generated) throw new Error(`No generated text for ${action.repo.name}`);

  const base =
    action.kind === 'rewrite'
      ? { featured: action.current.featured, order: action.current.order, locked: false }
      : { featured: false, order: nextOrder, locked: false };

  return {
    repo: action.repo.name,
    ...generated,
    ...base,
    ...meta,
    ...(readmeSha ? { readmeSha } : {}),
    source: 'ai',
  };
}
