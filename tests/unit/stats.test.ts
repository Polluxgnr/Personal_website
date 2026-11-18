import { describe, expect, it } from 'vitest';
import { sourceFrom, statsUrl, validCode } from '../../src/lib/stats.ts';

describe('validCode', () => {
  it('accepts plain subdomains and rejects anything else', () => {
    expect(validCode('pollux')).toBe(true);
    expect(validCode('my-site-2')).toBe(true);
    expect(validCode('')).toBe(false);
    expect(validCode(undefined)).toBe(false);
    expect(validCode('evil.example.com/x')).toBe(false);
    expect(validCode('UPPER')).toBe(false);
  });
});

describe('sourceFrom', () => {
  const own = 'polluxgronier.me';

  it('prefers a tagged link over the referrer', () => {
    expect(sourceFrom('?src=linkedin', 'https://www.google.com/', own)).toBe('linkedin');
    expect(sourceFrom('?utm_source=family&x=1', '', own)).toBe('family');
  });

  it('falls back to the referring site, but not to this site itself', () => {
    expect(sourceFrom('', 'https://www.linkedin.com/in/someone', own)).toBe(
      'https://www.linkedin.com/in/someone',
    );
    expect(sourceFrom('', 'https://polluxgronier.me/projects/', own)).toBe('');
    expect(sourceFrom('', '', own)).toBe('');
    expect(sourceFrom('', 'not a url', own)).toBe('');
  });

  it('keeps the source short', () => {
    expect(sourceFrom(`?src=${'a'.repeat(500)}`, '', own)).toHaveLength(80);
  });
});

describe('statsUrl', () => {
  it('builds a GoatCounter pixel URL with the page, title and source', () => {
    const url = new URL(
      statsUrl('pollux', {
        path: '/projects/',
        title: 'Projects | Pollux',
        source: 'linkedin',
        nonce: 'abc',
      }),
    );
    expect(url.origin).toBe('https://pollux.goatcounter.com');
    expect(url.pathname).toBe('/count');
    expect(url.searchParams.get('p')).toBe('/projects/');
    expect(url.searchParams.get('r')).toBe('linkedin');
    expect(url.searchParams.get('rnd')).toBe('abc');
  });

  it('leaves out an empty source', () => {
    const url = new URL(statsUrl('pollux', { path: '/', title: 'Home', source: '', nonce: 'x' }));
    expect(url.searchParams.has('r')).toBe(false);
  });
});
