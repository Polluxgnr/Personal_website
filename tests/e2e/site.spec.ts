import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import contactConfig from '../../src/contact.config.json' with { type: 'json' };

const pages = [
  '/',
  '/fr/',
  '/projects/',
  '/fr/projects/',
  '/about/',
  '/fr/about/',
  '/contact/',
  '/fr/contact/',
  '/projects/shockgraph-pea/',
  '/fr/projects/cinegraph/',
  '/cv/',
  '/fr/cv/',
];

/** Fails the test on any console error or uncaught exception. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

for (const tint of ['paper', 'abyss']) {
  test(`the home page stays accessible in the ${tint} tint`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('tint', t), tint);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

for (const path of pages) {
  test(`${path} has no accessibility violations or errors`, async ({ page }) => {
    const errors = watchErrors(page);
    // Scan the settled page: with motion on, text is still fading in when the scan starts.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${path} fits the screen without horizontal scrolling`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('home page shows the profile and links to GitHub and LinkedIn', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Pollux Gronier/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pollux');
  await expect(
    page.locator('a[href="https://www.linkedin.com/in/polluxgronier"]').first(),
  ).toBeVisible();
  await expect(page.locator('a[href="https://github.com/Polluxgnr"]').first()).toBeVisible();
  await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
});

test('no phone number or email address is published', async ({ page }) => {
  for (const path of ['/', '/about/', '/contact/', '/cv/']) {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/[\w.+-]+@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/(\+33|\b0)[\s.]?[67](?:[\s.]?\d{2}){4}/);
  }
});

test('the skill filter narrows the project list and survives a reload', async ({ page }) => {
  await page.goto('/projects/');
  const projects = page.locator('#work .project');
  const total = await projects.count();

  await page.locator('[data-filter]').getByRole('button', { name: 'Graphs', exact: true }).click();
  await expect(
    page.locator('[data-filter]').getByRole('button', { name: 'Graphs', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const visible = await page.locator('#work .project:visible').count();
  expect(visible).toBeGreaterThan(0);
  expect(visible).toBeLessThan(total);
  await expect(page).toHaveURL(/skill=graphs/);

  await page.reload();
  await expect(page.locator('#work .project:visible')).toHaveCount(visible);

  await page.locator('[data-filter]').getByRole('button', { name: 'Everything' }).click();
  await expect(page.locator('#work .project:visible')).toHaveCount(total);
});

test('the language switch keeps you on the same page', async ({ page, isMobile }) => {
  await page.goto('/projects/cinegraph/');
  if (isMobile) {
    await page.getByText('Menu', { exact: true }).click();
    await page.locator('.mobile').getByRole('link', { name: 'Français' }).click();
  } else {
    await page.getByRole('link', { name: 'Lire en français' }).click();
  }
  await expect(page).toHaveURL(/\/fr\/projects\/cinegraph\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('every project page linked from the projects page exists', async ({ page, request }) => {
  await page.goto('/projects/');
  const hrefs = await page
    .locator('a[href^="/projects/"]')
    .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')!))]);
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
});

test('both CV PDFs are served', async ({ request }) => {
  for (const lang of ['en', 'fr']) {
    const res = await request.get(`/cv/pollux-gronier-cv-${lang}.pdf`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
  }
});

test('there is no visible colour picker, only the secret T key', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Keyboard shortcut.');
  await page.goto('/');
  await expect(page.locator('[data-tint]')).toHaveCount(0);
  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('t');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
  await page.goto('/projects/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
});

test('the home page shows the photo above the fold', async ({ page }) => {
  await page.goto('/');
  const photo = page.locator('.hero img');
  await expect(photo).toBeVisible();
  const box = await photo.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && box.y < viewport.height).toBeTruthy();
});

// The site is built with whatever key src/contact.config.json holds.
const hasKey = Boolean(contactConfig.web3formsAccessKey);

test('the contact form validates, sends, and reports failures', async ({ page }) => {
  test.skip(!hasKey, 'No Web3Forms key yet; the next test covers that case.');
  // Never send real messages from tests: answer Web3Forms requests here instead.
  let answer = 200;
  let sent: Record<string, string> = {};
  await page.route('https://api.web3forms.com/**', async (route) => {
    sent = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({
      status: answer,
      contentType: 'application/json',
      body: JSON.stringify({ success: answer === 200 }),
    });
  });

  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('valid email');

  await page.getByLabel('Your name').fill('Ada Recruiter');
  await page.getByLabel('Your email').fill('ada@company.example');
  await page.getByLabel('Message').fill('Hello, we would like to talk about an internship.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('Message sent');
  expect(sent).toMatchObject({ name: 'Ada Recruiter', email: 'ada@company.example' });
  expect(sent.access_key).toBe(contactConfig.web3formsAccessKey);
  expect(sent.botcheck).toBeUndefined();
  await expect(page.getByLabel('Your name')).toHaveValue('');

  answer = 500;
  await page.getByLabel('Your name').fill('Ada Recruiter');
  await page.getByLabel('Your email').fill('ada@company.example');
  await page.getByLabel('Message').fill('Second try, after the service failed.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('was not sent');
});

test('without a key, the contact form says the message was not sent', async ({ page }) => {
  test.skip(hasKey, 'A key is configured; the previous test covers sending.');
  await page.goto('/contact/');
  await page.getByLabel('Your name').fill('Ada Recruiter');
  await page.getByLabel('Your email').fill('ada@company.example');
  await page.getByLabel('Message').fill('Hello, we would like to talk about an internship.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('not connected');
});

test('the header marks the current page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The phone menu is checked by the accessibility scan.');
  await page.goto('/projects/cinegraph/');
  await expect(page.locator('.desktop a[aria-current="page"]')).toHaveText('Projects');
});

test('the security policy is strict and the page calls no other site', async ({ page }) => {
  const foreign = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol.startsWith('http')) {
      foreign.add(url.origin);
    }
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const csp = await page
    .locator('meta[http-equiv="content-security-policy"]')
    .getAttribute('content');
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-src 'none'");
  expect(csp).toContain('upgrade-insecure-requests');
  expect(csp).not.toContain('unsafe-inline');
  expect(csp).not.toContain('unsafe-eval');
  expect([...foreign]).toEqual([]);
});

test('security.txt and humans.txt are published', async ({ request }) => {
  const security = await request.get('/.well-known/security.txt');
  expect(security.status()).toBe(200);
  expect(await security.text()).toContain('Contact:');
  expect((await request.get('/humans.txt')).status()).toBe(200);
});

test('the interactive background draws a grid and stays out of the way', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas[data-bg]');
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  const drawn = await canvas.evaluate((el) => {
    const c = el as HTMLCanvasElement;
    const data = c.getContext('2d')?.getImageData(0, 0, c.width, c.height).data;
    return data ? data.some((value, i) => i % 4 === 3 && value > 0) : false;
  });
  expect(drawn).toBe(true);
  expect(await canvas.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
});

test('a project page explains why it exists and how it works', async ({ page }) => {
  await page.goto('/projects/shockgraph-pea/');
  await expect(page.getByRole('heading', { name: 'Why I built it' })).toBeVisible();
  const steps = page.locator('[data-flow-step]');
  expect(await steps.count()).toBeGreaterThanOrEqual(3);
  // Tool logos are inline SVG drawn from the open Simple Icons set.
  expect(await page.locator('aside .tool svg').count()).toBeGreaterThan(0);
});

test('the T key cycles through the tints, but not while typing', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Keyboard shortcut.');
  await page.goto('/contact/');
  await page.getByLabel('Your name').fill('t');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'paper');
  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('t');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
});

test('the 404 page is friendly and links back', async ({ request }) => {
  const response = await request.get('/this-page-does-not-exist/');
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('easy to reach');
});

test('links carry a proper share image in both languages', async ({ page, request }) => {
  for (const [path, lang] of [
    ['/', 'en'],
    ['/fr/', 'fr'],
  ] as const) {
    await page.goto(path);
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toContain(`/og-${lang}.png`);
    const response = await request.get(`/og-${lang}.png`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('png');
    expect((await response.body()).byteLength).toBeGreaterThan(20_000);
  }
});

test('school logos are shown with accessible names, and the GitHub mark links out', async ({
  page,
}) => {
  await page.goto('/');
  for (const name of [
    'CentraleSupélec',
    'Université Paris-Saclay',
    'ESSEC Business School',
    'Universidad Carlos III de Madrid',
  ]) {
    await expect(page.getByRole('img', { name })).toHaveCount(1);
  }
  await page.goto('/contact/');
  await expect(
    page.locator('a[href="https://github.com/Polluxgnr"] [role="img"][aria-label="GitHub"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('a[href*="linkedin.com/in/polluxgronier"] [role="img"][aria-label="LinkedIn"]'),
  ).toHaveCount(1);
  // The school tiles link to the schools themselves.
  await page.goto('/');
  await expect(page.locator('a[href="https://www.essec.edu/"]')).toHaveCount(1);
});

test('the privacy page exists in both languages and says what the site records', async ({
  page,
}) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
  await expect(page.locator('main')).toContainText('no cookies');
  await page.goto('/fr/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Confidentialité');
  await expect(page.locator('main')).toContainText('aucun cookie');
});

test('visit counting is off by default: no counter attribute, no counter request', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).not.toHaveAttribute('data-stats', /.+/);
  expect(requests.filter((url) => url.includes('goatcounter'))).toEqual([]);
});
