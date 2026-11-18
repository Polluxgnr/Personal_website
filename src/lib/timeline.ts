import type { Lang } from '../i18n/ui.ts';
import { pick } from '../i18n/ui.ts';
import { formatRange } from './dates.ts';
import { profile } from './data.ts';
import type { Profile } from './schema.ts';

type Experience = Profile['experience'][number];

/** Newest first; entries without dates go last. */
export const byStartDesc = (a: Experience, b: Experience) =>
  (b.start ?? '').localeCompare(a.start ?? '');

export const experienceItems = (list: readonly Experience[], lang: Lang) =>
  list.map((e) => ({
    what: pick(e.role, lang),
    where: `${e.org}, ${e.place}`,
    when: formatRange(e.start, e.end, lang),
    points: e.points,
  }));

export const educationItems = (lang: Lang) =>
  profile.education.map((e) => ({
    what: pick(e.degree, lang),
    where: `${e.school}, ${e.place}`,
    when: formatRange(e.start, e.end, lang),
    points: e.points,
  }));

export const work = profile.experience.filter((e) => e.kind === 'work').toSorted(byStartDesc);
export const associations = profile.experience
  .filter((e) => e.kind !== 'work')
  .toSorted(byStartDesc);
