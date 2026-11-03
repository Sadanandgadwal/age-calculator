#!/usr/bin/env node
/**
 * Real-browser checks that jsdom can't do: layout at each screen size, console
 * errors, accessibility (axe-core) and SEO metadata.
 *
 *   npm run build && npm run test:e2e           checks the local production build
 *   E2E_URL=https://your.site npm run test:e2e  checks a deployed site
 *
 * Set CHROME_PATH if Chrome isn't at /usr/bin/google-chrome.
 * Screenshots are saved to e2e-output/.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

const VIEWPORTS = [
  { name: 'phone-small', width: 320, height: 640, stacked: true },
  { name: 'phone', width: 375, height: 812, stacked: true },
  { name: 'tablet', width: 768, height: 1024, stacked: false },
  { name: 'desktop', width: 1440, height: 900, stacked: false },
];
const OUTPUT_DIR = 'e2e-output';
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

let failures = 0;
function check(name, passed, detail = '') {
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`);
  if (!passed) failures += 1;
}

const setDate = (page, selector, value) =>
  page.$eval(
    selector,
    (element, nextValue) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(element, nextValue);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    },
    value,
  );

const hasText = (page, text) => page.evaluate((needle) => document.body.innerText.includes(needle), text);
const clickButton = (page, label) =>
  page.evaluate((name) => {
    [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === name).click();
  }, label);
const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

async function runAxe(page, label) {
  await page.evaluate(axeSource);
  const { violations } = await page.evaluate(() => window.axe.run());
  const summary = violations
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)
    .join(' | ');
  check(`no accessibility violations: ${label}`, violations.length === 0, summary);
}

async function checkViewport(browser, baseUrl, viewport) {
  console.log(`\n${viewport.name} (${viewport.width}x${viewport.height})`);
  const page = await browser.newPage();
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
  });

  await page.setViewport({ width: viewport.width, height: viewport.height });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const noOverflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

  check('no horizontal scroll: empty', await noOverflow());
  await runAxe(page, 'empty');

  await clickButton(page, 'Calculate Age');
  await settle();
  check('missing date of birth shows an error', await hasText(page, 'Please enter your date of birth.'));
  await runAxe(page, 'validation error');

  await page.focus('#dob');
  await page.keyboard.type('06');
  await clickButton(page, 'Calculate Age');
  await settle();
  check('partly typed date is reported as incomplete', await hasText(page, 'looks incomplete'));

  await clickButton(page, 'Reset');
  await settle();
  check('reset clears a partly typed date', await page.$eval('#dob', (element) => !element.validity.badInput));

  await setDate(page, '#dob', '1998-06-15');
  await setDate(page, '#asOf', '2026-11-03');
  await clickButton(page, 'Calculate Age');
  await settle();
  check('shows the calculated age', await hasText(page, '10,368 days'));
  check('no horizontal scroll: results', await noOverflow());
  await runAxe(page, 'results');

  const boxes = await page.evaluate(() => {
    const [form, results] = document.querySelector('[data-testid="calculator-layout"]').children;
    const box = (element) => {
      const { top, bottom, left, right } = element.getBoundingClientRect();
      return { top, bottom, left, right };
    };
    return { form: box(form), results: box(results) };
  });
  check(
    viewport.stacked ? 'input stacks above results' : 'input sits beside results',
    viewport.stacked ? boxes.results.top >= boxes.form.bottom : boxes.results.left >= boxes.form.right,
  );

  const smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('main button, main input')]
      .filter((element) => element.getBoundingClientRect().height < 44)
      .map((element) => element.id || element.textContent.trim()),
  );
  check('touch targets are at least 44px tall', smallTargets.length === 0, smallTargets.join(', '));

  const lineHeightRatio = await page.$eval('h1', (heading) => {
    const { height } = heading.getBoundingClientRect();
    return height / parseFloat(getComputedStyle(heading).lineHeight);
  });
  check('app name fits on one line', lineHeightRatio < 1.5);

  const actionTops = await page.evaluate(() =>
    ['Copy', 'Share', 'Print'].map((name) =>
      [...document.querySelectorAll('button')]
        .find((button) => button.textContent.trim() === name)
        .getBoundingClientRect().top,
    ),
  );
  check('result actions share one row', new Set(actionTops).size === 1);

  await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.name}.png`, fullPage: true });
  check('no console errors or failed requests', problems.length === 0, problems.join(' | '));
  await page.close();
}

async function checkSeo(browser, baseUrl) {
  console.log('\nSEO');
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const seo = await page.evaluate(() => {
    const content = (selector) => document.querySelector(selector)?.getAttribute('content');
    return {
      title: document.title,
      description: content('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogTitle: content('meta[property="og:title"]'),
      ogImage: content('meta[property="og:image"]'),
      favicon: document.querySelector('link[rel="icon"]')?.href,
      h1Count: document.querySelectorAll('h1').length,
      structuredData: document.querySelector('script[type="application/ld+json"]')?.textContent,
    };
  });

  check('title', seo.title.startsWith('Age Calculator'), seo.title);
  check('meta description', (seo.description ?? '').length > 50);
  check('canonical URL', Boolean(seo.canonical), seo.canonical);
  check('Open Graph tags', Boolean(seo.ogTitle && seo.ogImage));
  check('single h1', seo.h1Count === 1);

  let validStructuredData = false;
  try {
    validStructuredData = JSON.parse(seo.structuredData)['@type'] === 'WebApplication';
  } catch {
    // Reported by the check below.
  }
  check('structured data is valid JSON', validStructuredData);

  for (const path of ['/robots.txt', '/sitemap.xml', '/favicon.svg', '/og-image.png', '/privacy.html']) {
    const response = await fetch(new URL(path, baseUrl));
    check(`${path} is served`, response.ok, String(response.status));
  }
  await page.close();
}

async function checkPrint(browser, baseUrl) {
  console.log('\nPrint');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await setDate(page, '#dob', '1998-06-15');
  await setDate(page, '#asOf', '2026-11-03');
  await clickButton(page, 'Calculate Age');
  await settle();
  await page.emulateMediaType('print');

  const layout = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="calculator-layout"]');
    const [form, results] = container.children;
    return {
      formHidden: getComputedStyle(form).display === 'none',
      widthRatio: results.getBoundingClientRect().width / container.getBoundingClientRect().width,
    };
  });
  check('form is hidden', layout.formHidden);
  check('results use the full page width', layout.widthRatio > 0.95, layout.widthRatio.toFixed(2));

  await page.pdf({ path: `${OUTPUT_DIR}/print.pdf`, format: 'A4' });
  await page.close();
}

async function checkCopy(browser, baseUrl) {
  console.log('\nClipboard');
  const context = browser.defaultBrowserContext();
  await context.overridePermissions(new URL(baseUrl).origin, [
    'clipboard-read',
    'clipboard-write',
    'clipboard-sanitized-write',
  ]);

  const page = await browser.newPage();
  await page.bringToFront();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await setDate(page, '#dob', '1998-06-15');
  await setDate(page, '#asOf', '2026-11-03');
  await clickButton(page, 'Calculate Age');
  await settle();
  await clickButton(page, 'Copy');
  await settle();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  check('copy writes the result to the clipboard', copied.includes('28 years, 4 months, 19 days'));
  await page.close();
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const server = process.env.E2E_URL ? null : await preview({ preview: { port: 4173 }, logLevel: 'silent' });
const baseUrl = process.env.E2E_URL ?? server.resolvedUrls.local[0];
console.log(`Checking ${baseUrl}`);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});

try {
  for (const viewport of VIEWPORTS) {
    await checkViewport(browser, baseUrl, viewport);
  }
  await checkSeo(browser, baseUrl);
  await checkPrint(browser, baseUrl);
  await checkCopy(browser, baseUrl);
} finally {
  await browser.close();
  await server?.close();
}

console.log(failures === 0 ? '\nAll browser checks passed.' : `\n${failures} browser check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
