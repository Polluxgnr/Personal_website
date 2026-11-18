import { z } from 'zod';

/** A string in both site languages. */
export const Localized = z.object({
  en: z.string().min(1),
  fr: z.string().min(1),
});
export type Localized = z.infer<typeof Localized>;

const YearMonth = z.string().regex(/^\d{4}(-\d{2})?$/, 'Use YYYY or YYYY-MM');

export const Experience = z.object({
  /** Paid work, a student association, or a competition. */
  kind: z.enum(['work', 'association', 'competition']),
  org: z.string(),
  role: Localized,
  place: z.string(),
  /** Omit both dates when they are not stated anywhere. */
  start: YearMonth.optional(),
  end: YearMonth.optional(),
  points: z.array(Localized).min(1),
});

export const Education = z.object({
  school: z.string(),
  degree: Localized,
  place: z.string(),
  start: YearMonth,
  end: YearMonth,
  points: z.array(Localized),
});

export const Profile = z.object({
  name: z.string(),
  location: z.string(),
  role: Localized,
  headline: Localized,
  /** What I'm doing right now, shown under the headline. */
  now: Localized,
  intro: z.array(Localized).min(1),
  /** My path, place by place, shown on the Background page. */
  journey: z.array(z.object({ when: z.string(), title: Localized, text: Localized })).min(1),
  lookingFor: Localized,
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
    site: z.url(),
  }),
  experience: z.array(Experience),
  education: z.array(Education),
  skills: z.array(z.object({ group: Localized, items: z.array(z.string()).min(1) })),
  languages: z.array(z.object({ name: Localized, level: Localized })),
  interests: z.array(Localized),
});
export type Profile = z.infer<typeof Profile>;

export const Category = z.enum(['ai', 'data', 'finance', 'tools', 'coursework']);
export type Category = z.infer<typeof Category>;

export const Step = z.object({ title: Localized, detail: Localized });
export type Step = z.infer<typeof Step>;

export const Project = z.object({
  /** GitHub repository name; also the URL slug. */
  repo: z.string().regex(/^[\w.-]+$/),
  title: z.string(),
  /** The question the project answers, shown first. */
  question: Localized,
  summary: Localized,
  /** Why the project exists, in my words, from the README only. */
  why: Localized.optional(),
  /** How it works, as three to six ordered steps. */
  architecture: z.array(Step).min(2).max(7).optional(),
  highlights: z.array(Localized).max(5),
  /** Tools and libraries, shown as written. */
  stack: z.array(z.string()),
  /** Canonical skills, used to draw the skill graph. */
  skills: z.array(z.string()).min(1).max(6),
  category: Category,
  featured: z.boolean(),
  /** Lower comes first. */
  order: z.number().int(),
  homepage: z.url().optional(),
  /** Last push to the repository (ISO date), from the GitHub API. */
  pushedAt: z.iso.date(),
  /** Git blob SHA of the README the text was written from; the sync rewrites only when it changes. */
  readmeSha: z.string().optional(),
  /** Who wrote the text: the weekly AI sync, or a person. */
  source: z.enum(['ai', 'manual']),
  /** When true, the sync never rewrites this entry's text. */
  locked: z.boolean().default(false),
});
export type Project = z.infer<typeof Project>;

export const Projects = z.array(Project).superRefine((list, ctx) => {
  const seen = new Set<string>();
  for (const p of list) {
    if (seen.has(p.repo)) ctx.addIssue({ code: 'custom', message: `Duplicate repo ${p.repo}` });
    seen.add(p.repo);
  }
});
