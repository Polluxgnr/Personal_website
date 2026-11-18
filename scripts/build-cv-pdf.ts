/**
 * Prints the built /cv/ pages to A4 PDFs, so the downloadable CV is always
 * generated from the same data as the site. Run after `astro build`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { serveDist } from './serve-dist.ts';

const pages = [
  { path: '/cv/', out: 'dist/cv/pollux-gronier-cv-en.pdf' },
  { path: '/fr/cv/', out: 'dist/cv/pollux-gronier-cv-fr.pdf' },
];

const { url, server } = await serveDist('dist');
const browser = await chromium.launch();
try {
  await mkdir('dist/cv', { recursive: true });
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  for (const { path, out } of pages) {
    await page.goto(url + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });

    // The CV is meant to fit on one page; fail loudly if new content pushes it over.
    const pageCount = pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
    if (pageCount !== 1) throw new Error(`${path} printed to ${pageCount} pages instead of 1.`);
    await writeFile(out, pdf);
    console.log(`CV written to ${out}`);
  }
} finally {
  await browser.close();
  server.close();
}
