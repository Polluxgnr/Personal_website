import type { Lang } from '../i18n/ui.ts';

const format = (value: string, lang: Lang) => {
  const [year, month] = value.split('-');
  if (!month) return year ?? value;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

/**
 * "May 2026 – Aug 2026", "2024 – 2028", "Mar 2025" for a one-month stint.
 * Returns an empty string when no dates are known.
 */
export function formatRange(start: string | undefined, end: string | undefined, lang: Lang) {
  if (!start) return '';
  const from = format(start, lang);
  if (end === start) return from;
  return `${from} – ${end ? format(end, lang) : lang === 'fr' ? 'aujourd’hui' : 'now'}`;
}

export function formatDay(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}
