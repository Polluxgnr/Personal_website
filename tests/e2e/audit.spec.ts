import { expect, test } from '@playwright/test';

/**
 * A crawl of the whole built site: every page in the sitemap (plus the CV
 * pages, which are kept out of it) must have one h1, a unique title, a
 * description, a canonical URL, language alternates, alt text on images,
 * no duplicate ids, and only working internal links.
 */
test.describe('site audit', () => {
  test.skip(({ isMobile }) => isMobile, 'The crawl is the same on every device; run it once.');

  test('every page is well formed and every internal link works', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>https:\/\/polluxgronier\.me([^<]*)<\/loc>/g)].map(
      (m) => m[1] ?? '/',
    );
    for (const extra of ['/cv/', '/fr/cv/']) if (!paths.includes(extra)) paths.push(extra);
    expect(paths.length).toBeGreaterThan(30);

    const titles = new Map<string, string>();
    const links = new Set<string>();
    const problems: string[] = [];

    for (const path of paths) {
      await page.goto(path);
      const info = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
        return {
          h1: document.querySelectorAll('h1').length,
          title: document.title,
          description:
            document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
          alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) =>
            l.getAttribute('hreflang'),
          ),
          lang: document.documentElement.lang,
          missingAlt: [...document.querySelectorAll('img:not([alt])')].length,
          duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
          hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
          brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
            .map((a) => a.getAttribute('href') ?? '')
            .filter((h) => h.length > 1 && !document.getElementById(h.slice(1))),
        };
      });

      if (info.h1 !== 1) problems.push(`${path}: ${info.h1} h1 elements`);
      if (!info.title) problems.push(`${path}: no title`);
      // A name such as "Contact" or a project title is the same in both languages; within one language it must be unique.
      const key = `${info.lang}:${info.title}`;
      if (titles.has(key)) problems.push(`${path}: same title as ${titles.get(key)}`);
      titles.set(key, path);
      if (info.description.length < 40 || info.description.length > 200) {
        problems.push(`${path}: description is ${info.description.length} characters`);
      }
      if (!info.canonical.endsWith(path === '/' ? 'polluxgronier.me/' : path)) {
        problems.push(`${path}: canonical is ${info.canonical}`);
      }
      if (path !== '/cv/' && path !== '/fr/cv/' && info.alternates.length < 3) {
        problems.push(`${path}: only ${info.alternates.length} language alternates`);
      }
      if (!['en', 'fr'].includes(info.lang)) problems.push(`${path}: lang is "${info.lang}"`);
      if (info.missingAlt) problems.push(`${path}: ${info.missingAlt} images without alt`);
      if (info.duplicateIds.length) problems.push(`${path}: duplicate ids ${info.duplicateIds}`);
      if (info.brokenAnchors.length) problems.push(`${path}: broken anchors ${info.brokenAnchors}`);
      for (const href of info.hrefs) {
        if (href.startsWith('/') && !href.startsWith('//')) links.add(href.split('#')[0] ?? href);
      }
    }

    for (const href of links) {
      const status = (await request.get(href)).status();
      if (status !== 200) problems.push(`link ${href} answers ${status}`);
    }
    expect(problems).toEqual([]);
  });
});
