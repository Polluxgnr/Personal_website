/**
 * Visit counting with GoatCounter (goatcounter.com): no cookies, no stored IP
 * addresses. The page sends one tiny request per page view to
 * https://CODE.goatcounter.com/count with the page, its title and the source.
 * Pure functions here; src/scripts/analytics.ts does the sending.
 */

/** Query parameters that name where a visitor came from, in order of priority. */
export const SOURCE_PARAMS = ['src', 'ref', 'source', 'utm_source'] as const;

/** A GoatCounter site code is a plain lowercase subdomain. Anything else disables counting. */
export function validCode(code: string | undefined): code is string {
  return typeof code === 'string' && /^[a-z0-9][a-z0-9-]{1,28}$/.test(code);
}

/**
 * Where the visit came from. A tagged link wins (polluxgronier.me/?src=linkedin),
 * then the page that linked here, unless that page is this site itself.
 */
export function sourceFrom(search: string, referrer: string, ownHost: string): string {
  const params = new URLSearchParams(search);
  for (const key of SOURCE_PARAMS) {
    const value = params.get(key)?.trim();
    if (value) return value.slice(0, 80);
  }
  try {
    const host = new URL(referrer).hostname;
    if (host && host !== ownHost) return referrer.slice(0, 200);
  } catch {
    // No usable referrer: direct visit.
  }
  return '';
}

export function statsUrl(
  code: string,
  hit: { path: string; title: string; source: string; nonce: string },
): string {
  const url = new URL(`https://${code}.goatcounter.com/count`);
  url.searchParams.set('p', hit.path);
  url.searchParams.set('t', hit.title.slice(0, 200));
  if (hit.source) url.searchParams.set('r', hit.source);
  url.searchParams.set('rnd', hit.nonce);
  return url.href;
}
