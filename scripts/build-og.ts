/**
 * Renders the share images (Open Graph, 1200 x 630) shown when a link to the
 * site is posted on LinkedIn, Slack, iMessage and so on: dist/og-en.png and
 * dist/og-fr.png. They use the site's own fonts and portrait, so they always
 * match the design. Run after `astro build`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const font = async (pkg: string, file: string) =>
  `data:font/woff2;base64,${(await readFile(`node_modules/@fontsource-variable/${pkg}/files/${file}`)).toString('base64')}`;

const display = await font('archivo', 'archivo-latin-wdth-normal.woff2');
const text = await font('hanken-grotesk', 'hanken-grotesk-latin-wght-normal.woff2');
const portrait = await sharp('src/assets/profile.jpg')
  // Phone photos store their orientation in EXIF; apply it before cropping.
  .rotate()
  .resize(420, 540, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82 })
  .toBuffer();

const subtitles = {
  en: 'AI and data science student at CentraleSupélec and ESSEC',
  fr: 'Étudiant en IA et data science à CentraleSupélec et à l’ESSEC',
} as const;

const html = (subtitle: string) => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: U; src: url(${display}); font-weight: 100 900; font-stretch: 62% 125%; }
  @font-face { font-family: H; src: url(${text}); font-weight: 100 900; }
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0a0a0b; color: #f5f4f0;
    background-image: radial-gradient(circle, rgba(245,244,240,.16) 1.3px, transparent 1.8px);
    background-size: 36px 36px; font-family: H; }
  .bar { position: absolute; inset: 0 0 auto; height: 10px; background: #ff5a1f; }
  h1 { position: absolute; left: 72px; top: 118px; font: 900 96px/1 U; font-stretch: 125%; letter-spacing: -0.02em; text-transform: uppercase; }
  p { position: absolute; left: 72px; top: 336px; width: 560px; font-size: 34px; line-height: 1.35; font-weight: 500; }
  .url { top: auto; bottom: 64px; color: #ff5a1f; font-weight: 700; font-size: 32px; }
  img { position: absolute; right: 72px; top: 45px; width: 420px; height: 540px; object-fit: cover; border-radius: 32px; }
</style>
<div class="bar"></div>
<h1>Pollux<br>Gronier</h1>
<p>${subtitle}</p>
<p class="url">polluxgronier.me</p>
<img src="data:image/jpeg;base64,${portrait.toString('base64')}" alt="">`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const lang of ['en', 'fr'] as const) {
    await page.setContent(html(subtitles[lang]));
    await page.evaluate(() => document.fonts.ready);
    await writeFile(`dist/og-${lang}.png`, await page.screenshot({ type: 'png' }));
    console.log(`Share image written to dist/og-${lang}.png`);
  }
} finally {
  await browser.close();
}
