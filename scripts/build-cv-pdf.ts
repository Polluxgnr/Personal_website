/**
 * Prints the built /cv/ pages to A4 PDFs, so the downloadable CV is always
 * generated from the same data as the site. Run after `astro build`.
 */
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { serveDist } from './serve-dist.ts';

const pages = [{ path: '/fr/cv-print/', out: 'dist/cv/pollux-gronier-cv-fr' }];

const { url, server } = await serveDist('dist');
const browser = await chromium.launch();
try {
  await mkdir('dist/cv', { recursive: true });
  // The English download is my own hand-made CV (contact details removed); French is printed from the site data.
  await copyFile('assets-src/cv-pollux-gronier-en.pdf', 'dist/cv/pollux-gronier-cv-en.pdf');
  // A4 at 96 dpi, doubled for the picture shown on the CV page.
  const context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  for (const { path, out } of pages) {
    await page.goto(url + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });

    // The CV is meant to fit on one page; fail loudly if new content pushes it over.
    const pageCount = pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
    if (pageCount !== 1) throw new Error(`${path} printed to ${pageCount} pages instead of 1.`);
    await writeFile(`${out}.pdf`, pdf);
    const sheet = page.locator('.sheet');
    await sheet.screenshot({ path: `${out}.jpg`, type: 'jpeg', quality: 88 });
    console.log(`CV written to ${out}.pdf and ${out}.jpg`);
  }
} finally {
  await browser.close();
  server.close();
}
