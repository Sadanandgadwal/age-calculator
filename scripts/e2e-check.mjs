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
const STATIC_ROUTES = [
  { path: '/', h1: 'Everyday Tools, All in One Place' },
  { path: '/all-tools', h1: 'All Tools' },
  { path: '/calculators', h1: 'Calculators' },
  { path: '/converters', h1: 'Converters' },
  { path: '/date-time', h1: 'Date & Time' },
  { path: '/finance', h1: 'Finance' },
  { path: '/about', h1: 'About ToolNest' },
  { path: '/contact', h1: 'Contact' },
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

  // What a crawler receives before any JavaScript runs.
  const rawHtml = await (await fetch(baseUrl)).text();
  check('raw HTML contains the h1', /<h1[^>]*>Age Calculator<\/h1>/.test(rawHtml));
  check('raw HTML contains the page content', rawHtml.includes('Frequently asked questions'));
  check('no unreplaced placeholders', !rawHtml.includes('__SITE_URL__'));
  check('no leftover template comments', !rawHtml.includes('google-site-verification-->'));

  const schemas = [...rawHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1]),
  );
  const types = schemas.map((schema) => schema['@type']);
  check('structured data types', ['WebApplication', 'BreadcrumbList', 'FAQPage'].every((type) => types.includes(type)), types.join(', '));

  const authorUrl = 'https://sadanandgadwal.com';
  check('author metadata is present', rawHtml.includes('<meta name="author" content="Sadanand Gadwal"') && rawHtml.includes(`<link rel="author" href="${authorUrl}"`));
  check(
    'structured data names the author',
    schemas
      .filter((schema) => ['WebApplication', 'WebSite'].includes(schema['@type']))
      .every((schema) => schema.author?.name === 'Sadanand Gadwal' && schema.author?.url === authorUrl),
  );
  check('author is not displayed on the page', !(await page.evaluate(() => /sadanand/i.test(document.body.innerText))));

  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  const pageText = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '));
  const hiddenFromPage = (faq?.mainEntity ?? []).filter(
    ({ name, acceptedAnswer }) => !pageText.includes(name) || !pageText.includes(acceptedAnswer.text),
  );
  check('every FAQ schema entry is on the page', hiddenFromPage.length === 0, hiddenFromPage.map((item) => item.name).join(', '));

  for (const path of ['/robots.txt', '/sitemap.xml', '/favicon.svg', '/og-image.png', '/og-site.png', '/privacy.html', '/404.html']) {
    const response = await fetch(new URL(path, baseUrl));
    check(`${path} is served`, response.ok, String(response.status));
  }
  await page.close();
}

/** Every route: direct loading, refresh, its own SEO tags, layout and accessibility. */
async function checkRoutes(browser, siteUrl) {
  console.log('\nRoutes');
  const sitemap = await (await fetch(new URL('/sitemap.xml', siteUrl))).text();
  const sitemapPaths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  const routes = [...new Set([...STATIC_ROUTES.map(({ path }) => path), ...sitemapPaths])];
  const expectedH1 = new Map(STATIC_ROUTES.map(({ path, h1 }) => [path, h1]));

  check('sitemap lists the home page and tools', sitemapPaths.includes('/') && sitemapPaths.includes('/age-calculator'));
  check('sitemap has no duplicates', new Set(sitemapPaths).size === sitemapPaths.length);

  const titles = new Map();
  const descriptions = new Map();

  for (const path of routes) {
    const url = new URL(path, siteUrl).href;
    const raw = await fetch(url);
    const html = await raw.text();
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
    const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
    const canonical = html.match(/<link rel="canonical" href="(.*?)"/)?.[1] ?? '';
    const isNoindex = html.includes('content="noindex');

    check(`${path}: raw HTML is correct`, raw.ok && /<h1[^>]*>/.test(html) && canonical.endsWith(path) && Boolean(description));
    check(`${path}: only indexable pages are in the sitemap`, sitemapPaths.includes(path) === !isNoindex);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const types = schemas.map((schema) => schema['@type']);
    const breadcrumb = schemas.find((schema) => schema['@type'] === 'BreadcrumbList');
    if (path !== '/') {
      check(`${path}: breadcrumb data ends at this page`, breadcrumb?.itemListElement.at(-1).item.endsWith(path));
    }
    check(`${path}: has Open Graph and Twitter tags`, ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:title', 'twitter:image'].every((tag) => html.includes(`"${tag}"`)));
    if (types.includes('WebApplication')) {
      const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
      const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const missing = (faq?.mainEntity ?? []).filter(({ name, acceptedAnswer }) => !text.includes(name) || !text.includes(acceptedAnswer.text));
      check(`${path}: FAQ data matches the visible page`, Boolean(faq) && missing.length === 0, missing.map(({ name }) => name).join(', '));
    }
    titles.set(title, path);
    descriptions.set(description, path);

    for (const viewport of [{ width: 320, height: 640 }, { width: 1440, height: 900 }]) {
      const page = await browser.newPage();
      const problems = [];
      page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
      page.on('pageerror', (error) => problems.push(error.message));
      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector('h1');

      const state = await page.evaluate(() => ({
        h1: [...document.querySelectorAll('h1')].map((heading) => heading.textContent),
        title: document.title,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        author: /sadanand/i.test(document.body.innerText),
      }));
      const label = `${path} at ${viewport.width}px`;
      const wanted = expectedH1.get(path);
      check(`${label}: one h1 and the right title after refresh`, state.h1.length === 1 && (!wanted || state.h1[0] === wanted) && state.title === title.replace(/&amp;/g, '&'), state.h1.join(', '));
      check(`${label}: no horizontal scroll`, !state.overflow);
      check(`${label}: author is not displayed`, !state.author);
      await runAxe(page, label);
      check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
      await page.screenshot({ path: `${OUTPUT_DIR}/route${path === '/' ? '-home' : path.replace(/\//g, '-')}-${viewport.width}.png`, fullPage: true });
      await page.close();
    }
  }

  const privacy = await (await fetch(new URL('/privacy.html', siteUrl))).text();
  check('privacy page has a canonical URL', /<link rel="canonical" href="[^"]*\/privacy\.html"/.test(privacy));
  check('every page has a unique title', titles.size === routes.length);
  check('every page has a unique description', descriptions.size === routes.length);
}

async function checkMarks(browser, siteUrl) {
  console.log('\nMarks & Percentage Calculator');
  const url = new URL('/marks-percentage-calculator', siteUrl).href;
  await browser.defaultBrowserContext().overridePermissions(new URL(siteUrl).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.bringToFront();
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'networkidle0' });
    const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: shows validation errors`, await hasText(page, 'Please enter a subject name.'));
    await runAxe(page, `${label} errors`);

    await page.$eval('details.group', (details) => { details.open = true; });
    await settle();
    await runAxe(page, `${label} grading scale open`);
    check(`${label}: no horizontal scroll with the grading scale open`, await noOverflow());

    await clickButton(page, 'Add subject');
    await settle();
    const subjects = [['Maths', '100', '90'], ['Art', '50', '20'], ['Music', '50', '40'], ['Very Long Subject Name For Layout Testing', '100', '50']];
    for (const [index, [name, max, obtained]] of subjects.entries()) {
      const id = index + 1;
      await setDate(page, `#subject-${id}-name`, name);
      await setDate(page, `#subject-${id}-max`, max);
      await setDate(page, `#subject-${id}-obtained`, obtained);
    }
    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: calculates the percentage`, await hasText(page, '66.67%'));
    check(`${label}: no horizontal scroll with results`, await noOverflow());
    await runAxe(page, `${label} results`);
    await checkResultActions(page, label);
    await page.screenshot({ path: `${OUTPUT_DIR}/marks-${viewport.width}.png`, fullPage: true });

    await clickButton(page, 'Copy results');
    await settle();
    check(`${label}: copies results`, (await page.evaluate(() => navigator.clipboard.readText())).includes('Maths: 90 / 100 (90%)'));

    await clickButton(page, 'Target');
    await settle();
    await setDate(page, '#target-percent', '75');
    await setDate(page, '#target-obtained', '200');
    await setDate(page, '#target-max', '250');
    await setDate(page, '#target-remaining', '250');
    await page.evaluate(() => [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Calculate' && button.offsetParent).click());
    await settle();
    check(`${label}: calculates target marks`, await hasText(page, 'You need 175 of the 250 marks remaining.'));
    check(`${label}: no horizontal scroll in target mode`, await noOverflow());
    await runAxe(page, `${label} target`);
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkPercentage(browser, siteUrl) {
  console.log('\nPercentage Calculator');
  const cases = [
    ['% of a number', '20', '500', '20% of 500 is 100'],
    ['X is what %', '50', '200', '50 is 25% of 200'],
    ['Find the whole', '50', '25', '50 is 25% of 200'],
    ['Increase', '500', '20', 'Increase 500 by 20% = 600'],
    ['Decrease', '500', '20', 'Decrease 500 by 20% = 400'],
    ['Difference', '100', '150', 'The percentage difference between 100 and 150 is 40%'],
    ['Add %', '500', '20', '500 + 20% = 600'],
    ['Subtract %', '500', '20', '500 − 20% = 400'],
    ['Change', '100', '150', 'From 100 to 150 is an increase of 50%'],
  ];

  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL('/percentage-calculator', siteUrl).href, { waitUntil: 'networkidle0' });

    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: shows validation errors`, await hasText(page, 'Please enter a value.'));
    await runAxe(page, `${label} errors`);

    for (const [mode, a, b, answer] of cases) {
      await clickButton(page, mode);
      await settle();
      await setDate(page, '#percent-a', a);
      await setDate(page, '#percent-b', b);
      await clickButton(page, 'Calculate');
      await settle();
      check(`${label} ${mode}: shows the answer`, await hasText(page, answer));
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${label}: no horizontal scroll`, !overflow);
    await runAxe(page, `${label} results`);
    await checkResultActions(page, label);
    await page.screenshot({ path: `${OUTPUT_DIR}/percentage-${viewport.width}.png`, fullPage: true });
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkConverter(browser, siteUrl, { title, path, screenshot, cases, clearLabel = 'Clear' }) {
  console.log(`\n${title}`);
  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL(path, siteUrl).href, { waitUntil: 'networkidle0' });
    await runAxe(page, `${label} empty`);

    await setDate(page, '#convert-value', 'abc');
    await settle();
    check(`${label}: shows an error for invalid input`, await hasText(page, 'Please enter a valid number.'));
    await runAxe(page, `${label} error`);

    for (const [value, from, to, answer] of cases) {
      await setDate(page, '#convert-value', value);
      await page.select('#convert-from', from);
      await page.select('#convert-to', to);
      await settle();
      check(`${label}: ${value} ${from} to ${to}`, await hasText(page, answer));
    }

    await page.evaluate(() => document.querySelector('[aria-label="Swap units"]').click());
    await settle();
    const [fromValue, toValue] = await page.evaluate(() => [document.querySelector('#convert-from').value, document.querySelector('#convert-to').value]);
    const last = cases.at(-1);
    check(`${label}: swap exchanges the units`, fromValue === last[2] && toValue === last[1]);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${label}: no horizontal scroll`, !overflow);
    await runAxe(page, `${label} result`);
    await checkResultActions(page, label);
    await page.screenshot({ path: `${OUTPUT_DIR}/${screenshot}-${viewport.width}.png`, fullPage: true });

    await setDate(page, '#convert-value', '1000000000000');
    await page.select('#convert-from', cases[0][1]);
    await page.select('#convert-to', cases[0][2]);
    await settle();
    const longOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${label}: long results do not overflow`, !longOverflow);

    await clickButton(page, clearLabel);
    await settle();
    check(`${label}: ${clearLabel} empties the value`, (await page.$eval('#convert-value', (input) => input.value)) === '');
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkDate(browser, siteUrl) {
  console.log('\nDate Calculator');
  const ranges = [
    ['Days between', '2026-01-01', '2026-03-01', '8 weeks, 3 days'],
    ['Business days', '2026-11-02', '2026-11-08', 'Monday, 2 Nov 2026'],
    ['Weekdays & weekends', '2024-02-28', '2024-03-01', 'Wednesday, 28 Feb 2024'],
  ];
  const shifts = [
    ['Add days', '2026-12-31', '1', '1 Jan 2027'],
    ['Subtract days', '2024-03-01', '1', '29 Feb 2024'],
    ['Add months', '2026-01-31', '1', '28 Feb 2026'],
    ['Subtract months', '2026-01-15', '1', '15 Dec 2025'],
    ['Add years', '2024-02-29', '1', '28 Feb 2025'],
    ['Subtract years', '2026-11-03', '26', '3 Nov 2000'],
    ['Date after N days', '2026-11-03', '30', '3 Dec 2026'],
  ];

  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL('/date-calculator', siteUrl).href, { waitUntil: 'networkidle0' });

    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: requires an end date`, await hasText(page, 'Please choose an end date.'));
    await runAxe(page, `${label} errors`);

    await setDate(page, '#date-end', '2020-01-01');
    await settle();
    check(`${label}: rejects a reversed range`, await hasText(page, 'The end date can\'t be earlier than the start date.'));

    for (const [mode, start, end, answer] of ranges) {
      await clickButton(page, mode);
      await settle();
      await setDate(page, '#date-start', start);
      await setDate(page, '#date-end', end);
      await clickButton(page, 'Calculate');
      await settle();
      check(`${label} ${mode}: shows results`, await hasText(page, answer));
    }
    await runAxe(page, `${label} range results`);
    await checkResultActions(page, label);
    await page.screenshot({ path: `${OUTPUT_DIR}/date-${viewport.width}.png`, fullPage: true });

    for (const [mode, start, amount, answer] of shifts) {
      await clickButton(page, mode);
      await settle();
      await setDate(page, '#date-start', start);
      await setDate(page, '#date-amount', amount);
      await clickButton(page, 'Calculate');
      await settle();
      check(`${label} ${mode}: shows the result`, await hasText(page, answer));
    }
    await runAxe(page, `${label} arithmetic results`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${label}: no horizontal scroll`, !overflow);
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkGst(browser, siteUrl) {
  console.log('\nGST Calculator');
  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL('/gst-calculator', siteUrl).href, { waitUntil: 'networkidle0' });
    const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

    check(`${label}: shows the tax disclaimer`, await hasText(page, 'does not replace professional tax advice'));
    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: requires an amount`, await hasText(page, 'Please enter an amount.'));
    await runAxe(page, `${label} errors`);

    await setDate(page, '#gst-amount', '1000');
    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: intra-state breakdown`, (await hasText(page, '₹90.00')) && (await hasText(page, '₹1,180.00')));
    await runAxe(page, `${label} results`);
    await checkResultActions(page, label);

    await clickButton(page, 'Inter-state');
    await settle();
    check(`${label}: inter-state breakdown`, (await hasText(page, '₹180.00')) && (await hasText(page, 'Not applicable')));

    await clickButton(page, 'Remove GST');
    await settle();
    await setDate(page, '#gst-amount', '1180');
    await settle();
    check(`${label}: removes GST`, await page.evaluate(() => [...document.querySelectorAll('dl > div')].some((row) => row.textContent.startsWith('Taxable Amount') && row.textContent.includes('₹1,000.00'))));

    await page.select('#gst-rate', 'custom');
    await settle();
    await setDate(page, '#gst-custom-rate', '7.5');
    await setDate(page, '#gst-amount', '999999999999.99');
    await settle();
    check(`${label}: long amounts do not overflow`, await noOverflow());
    const spills = await page.$$eval('[data-testid="result-card"]', (cards) =>
      cards.filter((card) => {
        const box = card.getBoundingClientRect();
        return [...card.querySelectorAll('span')].some((span) => {
          const inner = span.getBoundingClientRect();
          return inner.left < box.left - 1 || inner.right > box.right + 1;
        });
      }).length,
    );
    check(`${label}: long amounts stay inside their cards`, spills === 0, `${spills} spilling`);
    await runAxe(page, `${label} custom rate`);
    await page.screenshot({ path: `${OUTPUT_DIR}/gst-${viewport.width}.png`, fullPage: true });

    await clickButton(page, 'Reset');
    await settle();
    check(`${label}: reset clears the amount`, (await page.$eval('#gst-amount', (input) => input.value)) === '');
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkResultActions(page, label, copyOnly = false) {
  const names = await page.$$eval('button', (buttons) => buttons.filter((button) => button.offsetParent).map((button) => button.textContent.trim()));
  check(`${label}: offers copy, share and print`, copyOnly ? names.includes('Copy results') && !names.includes('Share') && !names.includes('Print') : ['Copy results', 'Share', 'Print'].every((name) => names.includes(name)));
  if (copyOnly) return;

  await page.emulateMediaType('print');
  const view = await page.evaluate(() => {
    const isVisible = (element) => Boolean(element) && getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().height > 0;
    const panel = document.querySelector('[data-print-keep]');
    const area = document.querySelector('.print-results');
    return {
      panel: isVisible(panel),
      width: panel.getBoundingClientRect().width / area.getBoundingClientRect().width,
      form: [...area.querySelectorAll('form, [role="group"]')].some(isVisible),
      actions: [...area.querySelectorAll('button')].some(isVisible),
      navigation: isVisible(document.querySelector('nav[aria-label="Main"]')),
    };
  });
  await page.emulateMediaType(null);
  check(`${label}: print shows only the results`, view.panel && !view.form && !view.actions && !view.navigation, JSON.stringify(view));
  check(`${label}: print uses the full width`, view.width > 0.95, view.width.toFixed(2));
}

async function checkFlows(browser, siteUrl, { title, path, screenshot, requiredError, flows, clearFirst }) {
  console.log(`\n${title}`);
  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL(path, siteUrl).href, { waitUntil: 'networkidle0' });

    if (clearFirst) await setDate(page, clearFirst, '');
    await clickButton(page, 'Calculate');
    await settle();
    check(`${label}: shows validation errors`, await hasText(page, requiredError));
    await runAxe(page, `${label} errors`);

    for (const { mode, inputs = {}, selects = {}, answer } of flows) {
      if (mode) await clickButton(page, mode);
      await settle();
      for (const [selector, value] of Object.entries(selects)) await page.select(selector, value);
      for (const [selector, value] of Object.entries(inputs)) await setDate(page, selector, value);
      await clickButton(page, 'Calculate');
      await settle();
      check(`${label}: ${mode ?? 'calculates'} shows ${answer}`, await hasText(page, answer));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      check(`${label}: ${mode ?? 'calculates'} has no horizontal scroll`, !overflow);
    }
    await runAxe(page, `${label} results`);
    await checkResultActions(page, label);
    await page.screenshot({ path: `${OUTPUT_DIR}/${screenshot}-${viewport.width}.png`, fullPage: true });

    await clickButton(page, 'Reset');
    await settle();
    check(`${label}: reset clears results`, await hasText(page, 'Your results will appear here'));
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkLiveTool(browser, siteUrl, { title, path, screenshot, steps, copyOnly }) {
  console.log(`\n${title}`);
  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL(path, siteUrl).href, { waitUntil: 'networkidle0' });
    await runAxe(page, `${label} initial`);
    await steps(page, label);
    await runAxe(page, `${label} after use`);
    await checkResultActions(page, label, copyOnly);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${label}: no horizontal scroll`, !overflow);
    await page.screenshot({ path: `${OUTPUT_DIR}/${screenshot}-${viewport.width}.png`, fullPage: true });
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setText(page, selector, value) {
  await page.$eval(
    selector,
    (element, next) => {
      const proto = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, next);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    },
    value,
  );
  await pause(50);
}

const outputText = (page) => page.$eval('[role="region"][aria-label="Output"]', (element) => element.textContent);
const resultCards = (page) => page.$$eval('[data-testid="result-card"]', (cards) => cards.map((card) => card.textContent));
const cardValue = (page, name) =>
  page.evaluate((label) => [...document.querySelectorAll('[data-testid="result-card"]')].find((card) => card.textContent.includes(label))?.textContent, name);

const DATE_TIME_CHECKS = [
  {
    name: 'countdown',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Countdown Timer',
        path: '/countdown-timer',
        screenshot: 'countdown',
        steps: async (page, label) => {
          await clickButton(page, 'Start');
          await settle();
          check(`${label}: requires a date`, await hasText(page, 'Please choose a target date.'));
          await setDate(page, '#countdown-date', '2020-01-01');
          await clickButton(page, 'Start');
          await settle();
          check(`${label}: explains a past date`, await hasText(page, 'has already passed'));
          await setDate(page, '#countdown-date', '2099-01-01');
          await setDate(page, '#countdown-name', 'Launch');
          await clickButton(page, 'Start');
          await settle();
          check(`${label}: starts with the event name`, await hasText(page, 'Time until Launch'));
          const first = await cardValue(page, 'Seconds');
          await pause(1300);
          check(`${label}: counts down live`, first !== (await cardValue(page, 'Seconds')));
          await clickButton(page, 'Pause');
          await settle();
          const paused = await cardValue(page, 'Seconds');
          await pause(1300);
          check(`${label}: pause holds the time`, paused === (await cardValue(page, 'Seconds')));
          await clickButton(page, 'Resume');
          await settle();
        },
      }),
  },
  {
    name: 'stopwatch',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Online Stopwatch',
        path: '/stopwatch',
        screenshot: 'stopwatch',
        steps: async (page, label) => {
          const reading = () => page.$eval('[role="timer"]', (element) => element.textContent);
          check(`${label}: starts at zero`, (await reading()) === '00:00:00.00');
          await clickButton(page, 'Start');
          await pause(600);
          const running = await reading();
          check(`${label}: counts while running`, running !== '00:00:00.00', running);
          await clickButton(page, 'Lap');
          await pause(400);
          await clickButton(page, 'Lap');
          await settle();
          check(`${label}: records laps`, (await page.$$('tbody tr')).length === 2);
          await clickButton(page, 'Pause');
          await settle();
          const paused = await reading();
          await pause(500);
          check(`${label}: pause holds the time`, paused === (await reading()));
          const seconds = Number(paused.split(':')[2]);
          check(`${label}: elapsed time is accurate`, seconds > 0.9 && seconds < 2.5, paused);
        },
      }),
  },
  {
    name: 'timezone',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Time Zone Converter',
        path: '/time-zone-converter',
        screenshot: 'time-zone',
        requiredError: 'Please choose a time.',
        flows: [
          { inputs: { '#tz-date': '2026-02-10', '#tz-time': '12:00' }, answer: 'Eastern Standard Time' },
          { inputs: { '#tz-date': '2026-08-10', '#tz-time': '12:00' }, answer: 'Eastern Daylight Time' },
          { selects: { '#tz-from': 'America/New_York', '#tz-to': 'Asia/Kolkata' }, inputs: { '#tz-date': '2026-03-08', '#tz-time': '02:30' }, answer: 'skipped when the clocks go forward' },
          { selects: { '#tz-from': 'Asia/Dubai', '#tz-to': 'UTC' }, inputs: { '#tz-date': '2026-02-10', '#tz-time': '02:00' }, answer: 'Tuesday, 10 Feb 2026' },
        ],
      }),
  },
  {
    name: 'business',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Business Days Calculator',
        path: '/business-days-calculator',
        screenshot: 'business-days',
        requiredError: 'Please choose an end date.',
        flows: [
          { inputs: { '#biz-start': '2026-11-02', '#biz-end': '2026-11-08' }, answer: 'Total Calendar Days\n7 days' },
          { inputs: { '#biz-start': '2026-01-01', '#biz-end': '2026-12-31' }, answer: 'Total Calendar Days\n365 days' },
        ],
      }),
  },
  {
    name: 'dayofweek',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Day of the Week Calculator',
        path: '/day-of-week-calculator',
        screenshot: 'day-of-week',
        requiredError: 'Please choose a date.',
        clearFirst: '#dow-date',
        flows: [
          { inputs: { '#dow-date': '1998-06-15' }, answer: 'Monday\nWeekday' },
          { inputs: { '#dow-date': '2030-12-25' }, answer: 'Wednesday\nWeekday' },
          { inputs: { '#dow-date': '2024-02-29' }, answer: 'Days in the Year\n366' },
        ],
      }),
  },
  {
    name: 'pomodoro',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Pomodoro Timer',
        path: '/pomodoro-timer',
        screenshot: 'pomodoro',
        steps: async (page, label) => {
          const reading = () => page.$eval('[role="timer"]', (element) => element.textContent);
          check(`${label}: starts at 25 minutes`, (await reading()) === '25:00');
          await clickButton(page, 'Start');
          await pause(1300);
          check(`${label}: counts down`, (await reading()) !== '25:00', await reading());
          await clickButton(page, 'Pause');
          await settle();
          const paused = await reading();
          await pause(1200);
          check(`${label}: pause holds the time`, paused === (await reading()));
          await clickButton(page, 'Short break');
          await settle();
          check(`${label}: shows the chosen session`, (await reading()) === '05:00' && (await hasText(page, 'Short break')));
          await setDate(page, '#pomodoro-short', '10');
          await settle();
          check(`${label}: uses a custom length`, (await reading()) === '10:00');
          await setDate(page, '#pomodoro-short', '0');
          await settle();
          check(`${label}: rejects an invalid length`, await hasText(page, 'Please enter 1 to 180 minutes.'));
          await runAxe(page, `${label} invalid length`);
          await setDate(page, '#pomodoro-short', '5');
          await settle();
        },
      }),
  },
  {
    name: 'leapyear',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Leap Year Checker',
        path: '/leap-year-checker',
        screenshot: 'leap-year',
        requiredError: 'Please enter a year.',
        flows: [
          { inputs: { '#leap-year': '2028' }, answer: '2028 is a leap year because it divides evenly by 4' },
          { inputs: { '#leap-year': '2100' }, answer: '2100 is not a leap year because it is a century year' },
          { inputs: { '#leap-year': '2400' }, answer: '2400 is a leap year because it is a century year' },
          { inputs: { '#leap-year': '2031' }, answer: '2031 is not a leap year because it does not divide evenly by 4' },
        ],
      }),
  },
  {
    name: 'weeknumber',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Week Number Calculator',
        path: '/week-number-calculator',
        screenshot: 'week-number',
        requiredError: 'Please choose a date.',
        clearFirst: '#week-date',
        flows: [
          { inputs: { '#week-date': '2030-06-12' }, answer: 'Week Code\n2030-W24' },
          { inputs: { '#week-date': '2016-01-01' }, answer: 'its ISO week belongs to 2015' },
          { inputs: { '#week-date': '2029-12-31' }, answer: 'Week Code\n2030-W01' },
        ],
      }),
  },
  {
    name: 'workhours',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Work Hours Calculator',
        path: '/work-hours-calculator',
        screenshot: 'work-hours',
        requiredError: 'Please choose a clock-in time.',
        flows: [
          { inputs: { '#work-in': '09:15', '#work-out': '19:45', '#work-break': '45' }, answer: '9 h 45 min\nNet Working Hours' },
          { inputs: { '#work-in': '21:30', '#work-out': '05:30', '#work-break': '' }, answer: 'treated as the next day' },
          { inputs: { '#work-in': '09:00', '#work-out': '19:00', '#work-break': '', '#work-standard': '7' }, answer: '3 h 0 min\nOvertime' },
        ],
      }),
  },
  {
    name: 'unix',
    run: (browser, siteUrl) =>
      checkFlows(browser, siteUrl, {
        title: 'Unix Timestamp Converter',
        path: '/unix-timestamp-converter',
        screenshot: 'unix-timestamp',
        requiredError: 'Please enter a timestamp.',
        flows: [
          { inputs: { '#unix-timestamp': '1800000000' }, answer: 'Fri, 15 Jan 2027 08:00:00 GMT' },
          { mode: 'Milliseconds', inputs: { '#unix-timestamp': '1800000000500' }, answer: '2027-01-15T08:00:00.500Z' },
          { mode: 'Date to timestamp', inputs: { '#unix-date': '2027-01-15', '#unix-time': '08:00:00' }, answer: 'Unix Milliseconds' },
          { mode: 'UTC', answer: '1800000000' },
        ],
      }),
  },
{
    name: 'wordcounter',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Word Counter',
        path: '/word-counter',
        screenshot: 'word-counter',
        steps: async (page, label) => {
          await setText(page, '#word-text', 'One two three. Four five!');
          const cards = await resultCards(page);
          check(`${label}: counts words`, cards.some((card) => card.includes('5') && card.includes('Words')));
          check(`${label}: counts sentences`, cards.some((card) => card.includes('2') && card.includes('Sentences')));
        },
      }),
  },
{
    name: 'charcounter',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Character Counter',
        path: '/character-counter',
        screenshot: 'character-counter',
        steps: async (page, label) => {
          await setText(page, '#char-text', 'Hello 😀 there');
          await setText(page, '#char-limit', '5');
          const cards = await resultCards(page);
          check(`${label}: counts an emoji once`, cards.some((card) => card.includes('13') && card.includes('Characters')));
          check(`${label}: shows the limit`, await hasText(page, '8 over the limit of 5'));
        },
      }),
  },
{
    name: 'linecounter',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Line Counter',
        path: '/line-counter',
        screenshot: 'line-counter',
        steps: async (page, label) => {
          await setText(page, '#line-text', 'one\n\ntwo\nthree\nfour');
          const cards = await resultCards(page);
          check(`${label}: counts all lines`, cards.some((card) => card.includes('5') && card.includes('Total Lines')));
          check(`${label}: counts blank lines`, cards.some((card) => card.includes('1') && card.includes('Blank Lines')));
        },
      }),
  },
{
    name: 'readingtime',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Reading Time Calculator',
        path: '/reading-time-calculator',
        screenshot: 'reading-time',
        steps: async (page, label) => {
          await setText(page, '#read-text', 'word '.repeat(476));
          const cards = await resultCards(page);
          check(`${label}: estimates reading time`, cards.some((card) => card.includes('2 min') && card.includes('Reading Time')));
        },
      }),
  },
{
    name: 'caseconverter',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Case Converter',
        path: '/case-converter',
        screenshot: 'case-converter',
        steps: async (page, label) => {
          await setText(page, '#case-text', 'the quick brown fox');
          check(`${label}: starts in upper case`, (await outputText(page)) === 'THE QUICK BROWN FOX');
          await clickButton(page, 'snake_case');
          await settle();
          check(`${label}: switches case`, (await outputText(page)) === 'the_quick_brown_fox');
        },
      }),
  },
{
    name: 'textreverser',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Text Reverser',
        path: '/text-reverser',
        screenshot: 'text-reverser',
        steps: async (page, label) => {
          await setText(page, '#reverse-text', 'one 😀 two');
          check(`${label}: reverses characters`, (await outputText(page)) === 'owt 😀 eno');
          await clickButton(page, 'Words');
          await settle();
          check(`${label}: reverses words`, (await outputText(page)) === 'two 😀 one');
        },
      }),
  },
{
    name: 'dedupe',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Remove Duplicate Lines',
        path: '/remove-duplicate-lines',
        screenshot: 'remove-duplicate-lines',
        steps: async (page, label) => {
          await setText(page, '#dedupe-text', 'pear\nplum\npear\nfig');
          check(`${label}: removes repeats in order`, (await outputText(page)) === 'pear\nplum\nfig');
          check(`${label}: counts the removed line`, (await resultCards(page)).some((card) => card.includes('1') && card.includes('Lines Removed')));
        },
      }),
  },
{
    name: 'extraspaces',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Remove Extra Spaces',
        path: '/remove-extra-spaces',
        screenshot: 'remove-extra-spaces',
        steps: async (page, label) => {
          await setText(page, '#spaces-text', '  one   two \n\n\nthree');
          check(`${label}: cleans the spacing`, (await outputText(page)) === 'one two\n\nthree');
        },
      }),
  },
{
    name: 'findreplace',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Find & Replace Text',
        path: '/find-replace-text',
        screenshot: 'find-replace-text',
        steps: async (page, label) => {
          await setText(page, '#replace-text', `${'a'.repeat(40)}b`);
          await setText(page, '#replace-find', '(a+)+$');
          await page.evaluate(() => [...document.querySelectorAll('label')].find((item) => item.textContent.includes('regular expression')).click());
          await clickButton(page, 'Replace all');
          await pause(2500);
          check(`${label}: stops a runaway pattern`, await hasText(page, 'This pattern took too long'));
          await setText(page, '#replace-text', 'one two');
          await setText(page, '#replace-find', '(\\w+) (\\w+)');
          await setText(page, '#replace-with', '$2 $1');
          await clickButton(page, 'Replace all');
          await pause(800);
          check(`${label}: replaces with a pattern in the worker`, (await outputText(page)) === 'two one');
        },
      }),
  },
{
    name: 'textsorter',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Text Sorter',
        path: '/text-sorter',
        screenshot: 'text-sorter',
        steps: async (page, label) => {
          await setText(page, '#sort-text', 'Item 10\nItem 2\nItem 1');
          check(`${label}: sorts naturally`, (await outputText(page)) === 'Item 1\nItem 2\nItem 10');
          await clickButton(page, 'Shuffle lines');
          await settle();
          check(`${label}: shuffle keeps every line`, (await outputText(page)).split('\n').length === 3);
        },
      }),
  },
{
    name: 'slug',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Slug Generator',
        path: '/slug-generator',
        screenshot: 'slug-generator',
        steps: async (page, label) => {
          await setText(page, '#slug-text', 'Café & Bistro: Open Now!');
          check(`${label}: creates the slug`, (await outputText(page)) === 'cafe-and-bistro-open-now');
        },
      }),
  },
{
    name: 'lorem',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Lorem Ipsum Generator',
        path: '/lorem-ipsum-generator',
        screenshot: 'lorem-ipsum',
        steps: async (page, label) => {
          check(`${label}: starts with the classic opening`, (await outputText(page)).startsWith('Lorem ipsum dolor'));
          await clickButton(page, 'Words');
          await setText(page, '#lorem-count', '25');
          check(`${label}: gives the requested number of words`, (await resultCards(page)).some((card) => card.includes('25') && card.includes('Words')));
        },
      }),
  },
{
    name: 'randomnumber',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Random Number Generator',
        path: '/random-number-generator',
        screenshot: 'random-number',
        steps: async (page, label) => {
          await setText(page, '#random-min', '1');
          await setText(page, '#random-max', '5');
          await setText(page, '#random-count', '6');
          await page.evaluate(() => [...document.querySelectorAll('label')].find((item) => item.textContent.includes('No repeats')).click());
          await clickButton(page, 'Generate');
          await settle();
          check(`${label}: refuses more unique numbers than the range has`, await hasText(page, 'This range only has 5 different numbers.'));
          await setText(page, '#random-count', '5');
          await clickButton(page, 'Generate');
          await settle();
          const numbers = (await outputText(page)).split(', ').map(Number).sort();
          check(`${label}: picks each number once`, numbers.join() === '1,2,3,4,5');
        },
      }),
  },
{
    name: 'password',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Password Generator',
        path: '/password-generator',
        screenshot: 'password-generator',
        copyOnly: true,
        steps: async (page, label) => {
          await clickButton(page, 'Generate');
          await settle();
          const first = await outputText(page);
          check(`${label}: creates a 16 character password`, first.length === 16);
          await clickButton(page, 'Generate');
          await settle();
          check(`${label}: creates a new password each time`, (await outputText(page)) !== first);
        },
      }),
  },
{
    name: 'qrcode',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'QR Code Generator',
        path: '/qr-code-generator',
        screenshot: 'qr-code',
        steps: async (page, label) => {
          await setText(page, '#qr-text', 'https://example.com');
          check(`${label}: draws the code`, (await page.$('svg[role="img"][aria-label="QR code for https://example.com"]')) !== null);
          check(`${label}: offers downloads`, await hasText(page, 'Download PNG'));
        },
      }),
  },
{
    name: 'jsonformat',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'JSON Formatter',
        path: '/json-formatter',
        screenshot: 'json-formatter',
        steps: async (page, label) => {
          await setText(page, '#json-format-text', '{"z":');
          check(`${label}: explains bad JSON`, await hasText(page, 'not valid JSON'));
          await setText(page, '#json-format-text', '{"big":12345678901234567890}');
          check(`${label}: formats and keeps exact numbers`, (await outputText(page)) === '{\n  "big": 12345678901234567890\n}');
        },
      }),
  },
{
    name: 'jsonvalidate',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'JSON Validator',
        path: '/json-validator',
        screenshot: 'json-validator',
        steps: async (page, label) => {
          await setText(page, '#json-validate-text', '{\n  "a": 1,\n}');
          check(`${label}: finds the error line`, await hasText(page, 'Line 3'));
          await setText(page, '#json-validate-text', '{"a":1,"a":2}');
          check(`${label}: accepts valid JSON`, (await resultCards(page)).some((card) => card.includes('Valid JSON')));
          check(`${label}: flags a repeated key`, await hasText(page, '1 key is repeated'));
        },
      }),
  },
{
    name: 'jsonminify',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'JSON Minifier',
        path: '/json-minifier',
        screenshot: 'json-minifier',
        steps: async (page, label) => {
          await setText(page, '#json-minify-text', '{\n  "name": "A  B",\n  "n": 1\n}');
          check(`${label}: minifies`, (await outputText(page)) === '{"name":"A  B","n":1}');
        },
      }),
  },
{
    name: 'base64',
    run: (browser, siteUrl) =>
      checkLiveTool(browser, siteUrl, {
        title: 'Base64 Encoder/Decoder',
        path: '/base64-encoder-decoder',
        screenshot: 'base64',
        steps: async (page, label) => {
          await setText(page, '#base64-text', 'नमस्ते 😀');
          const encoded = await outputText(page);
          check(`${label}: encodes`, encoded === '4KSo4KSu4KS44KWN4KSk4KWHIPCfmIA=');
          await clickButton(page, 'Decode');
          await settle();
          await setText(page, '#base64-text', encoded);
          check(`${label}: decodes back`, (await outputText(page)) === 'नमस्ते 😀');
        },
      }),
  },
];

async function checkPlatform(browser, siteUrl) {
  console.log('\nPlatform');
  const page = await browser.newPage();
  const problems = [];
  page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
  page.on('pageerror', (error) => problems.push(error.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });

  const heading = () => page.$eval('h1', (element) => element.textContent);
  const clickLink = async (selector) => {
    await page.click(selector);
    await settle();
    await page.waitForSelector('h1');
  };

  await page.type('#tool-search', 'birthday');
  await settle();
  check('home search finds a tool by name', await hasText(page, '1 tool found for “birthday”'));

  await page.$eval('#tool-search', (input) => input.select());
  await page.keyboard.type('zzzz');
  await settle();
  check('home search shows the empty state', await hasText(page, 'No tools match your search'));
  await runAxe(page, 'empty search');

  await page.$eval('#tool-search', (input) => input.select());
  await page.keyboard.type('date & time');
  await settle();
  check('home search finds tools by category', await hasText(page, '14 tools found'));

  await clickLink('a[aria-label="Open Tool: Age Calculator"]');
  check('tool card opens the tool', (await heading()) === 'Age Calculator' && new URL(page.url()).pathname === '/age-calculator');
  check('navigating updates the title', (await page.title()).startsWith('Age Calculator'));
  check('navigating updates the canonical URL', (await page.$eval('link[rel="canonical"]', (link) => link.href)).endsWith('/age-calculator'));

  await clickLink('nav[aria-label="Main"] a[href="/date-time"]');
  check('main navigation opens a category', (await heading()) === 'Date & Time');

  await clickLink('nav[aria-label="Filter by category"] a[href="/finance"]');
  check('category filter opens a category', (await heading()) === 'Finance');
  check('category lists its tools', await hasText(page, 'GST Calculator'));

  await page.goBack();
  await settle();
  check('browser back button works', (await heading()) === 'Date & Time');

  const sitemap = await (await fetch(new URL('/sitemap.xml', siteUrl))).text();
  for (const [path, name] of [['/pdf-tools', 'PDF Tools'], ['/image-tools', 'Image Tools'], ['/everyday-tools', 'Everyday Tools']]) {
    const response = await page.goto(new URL(path, siteUrl).href, { waitUntil: 'networkidle0' });
    check(`${path} opens its page`, response.status() === 200 && (await heading()) === name);
    check(`${path} is noindex while empty`, (await page.$eval('meta[name="robots"]', (tag) => tag.content)).includes('noindex'));
    check(`${path} is not in the sitemap`, !sitemap.includes(`${path}<`));
    check(`${path} is not in the main navigation`, (await page.$(`nav[aria-label="Main"] a[href="${path}"]`)) === null);
    await runAxe(page, path);
  }

  await page.setViewport({ width: 375, height: 812 });
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  check('mobile menu starts closed', (await page.$('#mobile-menu')) === null);
  await page.click('button[aria-controls="mobile-menu"]');
  await settle();
  await runAxe(page, 'mobile menu open');
  await clickLink('#mobile-menu a[href="/about"]');
  check('mobile menu navigates and closes', (await heading()) === 'About ToolNest' && (await page.$('#mobile-menu')) === null);

  const missing = await page.goto(new URL('/no-such-page', siteUrl).href, { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');
  check('unknown URL shows the not-found page', (await heading()) === 'Page not found');
  check('not-found page blocks indexing', (await page.$eval('meta[name="robots"]', (tag) => tag.content)).startsWith('noindex'));
  await runAxe(page, 'not found');
  await page.screenshot({ path: `${OUTPUT_DIR}/route-not-found.png`, fullPage: true });
  check('unknown URL returns status 404', missing.status() === 404, String(missing.status()));

  // Browsers log every 404 response, including the one requested on purpose above.
  const realProblems = problems.filter((problem) => !/404 \(Not Found\)/.test(problem));
  check('no console errors during navigation', realProblems.length === 0, realProblems.join(' | '));
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

async function checkConfetti(browser, baseUrl) {
  console.log('\nBirthday confetti');
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const birthdayToday = await page.evaluate(() => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear() - 24}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
  const paintedPixels = () =>
    page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="confetti"]');
      if (!canvas) return 0;
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let count = 0;
      for (let index = 3; index < data.length; index += 4) if (data[index] > 0) count += 1;
      return count;
    });
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await setDate(page, '#dob', '1998-06-15');
  await clickButton(page, 'Calculate Age');
  await settle();
  check('no confetti on an ordinary day', (await page.$('[data-testid="confetti"]')) === null);

  await setDate(page, '#dob', birthdayToday);
  await clickButton(page, 'Calculate Age');
  await pause(1000);
  const during = await paintedPixels();
  check('confetti is drawn on a birthday', during > 500, `${during} pixels`);
  await page.screenshot({ path: `${OUTPUT_DIR}/confetti.png` });

  const blocksClicks = await page.$eval('[data-testid="confetti"]', (canvas) => getComputedStyle(canvas).pointerEvents !== 'none');
  check('confetti does not block clicks', !blocksClicks);
  check(
    'confetti causes no horizontal scroll',
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  );

  await pause(5500);
  check('confetti clears itself', (await paintedPixels()) === 0);

  await clickButton(page, 'Calculate Age');
  await pause(800);
  check('calculating again replays the confetti', (await paintedPixels()) > 500);
  await page.close();

  const calmPage = await browser.newPage();
  await calmPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await calmPage.goto(baseUrl, { waitUntil: 'networkidle0' });
  await setDate(calmPage, '#dob', birthdayToday);
  await clickButton(calmPage, 'Calculate Age');
  await pause(800);
  const calmPixels = await calmPage.$eval('[data-testid="confetti"]', (canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    return data.some((value) => value > 0);
  });
  check('reduced-motion users get no animation', !calmPixels);
  check('reduced-motion users still see the birthday message', await hasText(calmPage, 'Happy birthday!'));
  await calmPage.close();
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
const siteUrl = process.env.E2E_URL ?? server.resolvedUrls.local[0];
const baseUrl = new URL('/age-calculator', siteUrl).href;
console.log(`Checking ${siteUrl}`);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});

try {
  const only = process.env.E2E_ONLY;
  if (only) {
    for (const item of DATE_TIME_CHECKS.filter(({ name }) => name === only)) await item.run(browser, siteUrl);
    await browser.close();
    await server?.close();
    console.log(failures === 0 ? '\nAll browser checks passed.' : `\n${failures} browser check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
  }
  for (const viewport of VIEWPORTS) {
    await checkViewport(browser, baseUrl, viewport);
  }
  await checkSeo(browser, baseUrl);
  await checkPrint(browser, baseUrl);
  await checkConfetti(browser, baseUrl);
  await checkCopy(browser, baseUrl);
  await checkMarks(browser, siteUrl);
  await checkPercentage(browser, siteUrl);
  await checkConverter(browser, siteUrl, {
    title: 'Weight Converter',
    path: '/kg-to-gram-converter',
    screenshot: 'weight',
    cases: [
      ['2.5', 'kg', 'g', '2.5 kg = 2,500 g'],
      ['1000', 'g', 'kg', '1,000 g = 1 kg'],
      ['1', 'kg', 'lb', '1 kg ≈ 2.204622622 lb'],
      ['1', 'lb', 'oz', '1 lb = 16 oz'],
      ['1', 't', 'mg', '1 t = 1,00,00,00,000 mg'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Length Converter',
    path: '/cm-to-feet-converter',
    screenshot: 'length',
    cases: [
      ['170', 'cm', 'ft', '5 ft 6.93 in'],
      ['2', 'ft', 'cm', '2 ft = 60.96 cm'],
      ['2', 'in', 'cm', '2 in = 5.08 cm'],
      ['1000', 'm', 'km', '1,000 m = 1 km'],
      ['1', 'mi', 'km', '1 mi = 1.609344 km'],
    ],
  });
  await checkDate(browser, siteUrl);
  await checkGst(browser, siteUrl);
  await checkFlows(browser, siteUrl, {
    title: 'EMI Calculator',
    path: '/emi-calculator',
    screenshot: 'emi',
    requiredError: 'Please enter the loan amount.',
    flows: [
      { inputs: { '#emi-amount': '1000000', '#emi-rate': '8.5', '#emi-tenure': '20' }, answer: '₹8,678.23' },
      { inputs: { '#emi-amount': '9999999999999', '#emi-rate': '12', '#emi-tenure': '30' }, answer: 'Yearly schedule' },
    ],
  });
  await checkFlows(browser, siteUrl, {
    title: 'Time Calculator',
    path: '/time-calculator',
    screenshot: 'time',
    requiredError: 'Please enter a time.',
    flows: [
      { inputs: { '#time-a-hours': '1', '#time-a-minutes': '45', '#time-b-minutes': '30' }, answer: '2 hours, 15 minutes, 0 seconds' },
      { mode: 'Subtract times', inputs: { '#time-a-hours': '0', '#time-a-minutes': '30', '#time-b-hours': '1', '#time-b-minutes': '' }, answer: '−0 hours, 30 minutes, 0 seconds' },
      { mode: 'Time between', inputs: { '#time-start': '22:00', '#time-end': '06:00' }, answer: '8 hours, 0 minutes, 0 seconds' },
      { mode: 'Time after', inputs: { '#time-start': '23:30', '#time-a-hours': '1', '#time-a-minutes': '' }, answer: '1 day later' },
      { mode: 'Time before', inputs: { '#time-start': '00:30', '#time-a-hours': '1', '#time-a-minutes': '' }, answer: '1 day earlier' },
    ],
  });
  await checkFlows(browser, siteUrl, {
    title: 'Discount Calculator',
    path: '/discount-calculator',
    screenshot: 'discount',
    requiredError: 'Please enter the original price.',
    flows: [
      { inputs: { '#discount-a': '1000', '#discount-b': '20' }, answer: '₹800.00' },
      { mode: 'Amount off', inputs: { '#discount-a': '1000', '#discount-b': '250' }, answer: '₹750.00' },
      { mode: 'Find the discount', inputs: { '#discount-a': '1000', '#discount-b': '750' }, answer: '₹250.00' },
      { mode: 'Find the original price', inputs: { '#discount-a': '800', '#discount-b': '20' }, answer: '₹1,000.00' },
    ],
  });
  await checkFlows(browser, siteUrl, {
    title: 'Bill Split Calculator',
    path: '/bill-split-calculator',
    screenshot: 'bill-split',
    requiredError: 'Please enter the bill amount.',
    flows: [
      { inputs: { '#bill-amount': '1000', '#bill-people': '5', '#bill-tax': '5', '#bill-tip': '10' }, answer: '₹230.00' },
      { inputs: { '#bill-amount': '100', '#bill-people': '3', '#bill-tax': '', '#bill-tip': '' }, answer: 'divide evenly: 1 person pays ₹33.34' },
      { inputs: { '#bill-amount': '9999999999999', '#bill-people': '7' }, answer: 'Each Person Pays' },
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Temperature Converter',
    path: '/temperature-converter',
    screenshot: 'temperature',
    clearLabel: 'Reset',
    cases: [
      ['100', 'c', 'f', '100 °C = 212 °F'],
      ['-40', 'f', 'c', '-40 °F = -40 °C'],
      ['25', 'c', 'k', '25 °C = 298.15 K'],
      ['0', 'k', 'f', '0 K = -459.67 °F'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Area Converter',
    path: '/area-converter',
    screenshot: 'area',
    clearLabel: 'Reset',
    cases: [
      ['2', 'acre', 'sqft', '2 ac = 87,120 sq ft'],
      ['5', 'cent', 'sqft', '5 cent = 2,178 sq ft'],
      ['3', 'hectare', 'sqm', '3 ha = 30,000 sq m'],
      ['18', 'sqft', 'sqyd', '18 sq ft = 2 sq yd'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Volume Converter',
    path: '/volume-converter',
    screenshot: 'volume',
    clearLabel: 'Reset',
    cases: [
      ['2', 'usgal', 'l', '2 US gal = 7.570823568 L'],
      ['2', 'ukgal', 'l', '2 UK gal = 9.09218 L'],
      ['3', 'm3', 'l', '3 m³ = 3,000 L'],
      ['8', 'cup', 'ml', '8 US cup = 1,892.705892 mL'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Data Storage Converter',
    path: '/data-storage-converter',
    screenshot: 'data-storage',
    clearLabel: 'Reset',
    cases: [
      ['2', 'gib', 'mib', '2 GiB = 2,048 MiB'],
      ['2', 'gb', 'mb', '2 GB = 2,000 MB'],
      ['3', 'tib', 'b', '3 TiB = 32,98,53,48,83,328 B'],
      ['1000', 'mib', 'gib', '1,000 MiB = 0.9765625 GiB'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Speed Converter',
    path: '/speed-converter',
    screenshot: 'speed',
    clearLabel: 'Reset',
    cases: [
      ['100', 'kmh', 'mph', '100 km/h ≈ 62.13711922 mph'],
      ['10', 'ms', 'kmh', '10 m/s = 36 km/h'],
      ['5', 'kn', 'kmh', '5 kn = 9.26 km/h'],
      ['2', 'mph', 'kmh', '2 mph = 3.218688 km/h'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Time Unit Converter',
    path: '/time-unit-converter',
    screenshot: 'time-unit',
    clearLabel: 'Reset',
    cases: [
      ['90', 'min', 'h', '90 min = 1.5 h'],
      ['3', 'week', 'day', '3 wk = 21 d'],
      ['2', 'year', 'day', '2 yr = 730.5 d'],
      ['7200', 's', 'min', '7,200 s = 120 min'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Pressure Converter',
    path: '/pressure-converter',
    screenshot: 'pressure',
    clearLabel: 'Reset',
    cases: [
      ['2', 'bar', 'kpa', '2 bar = 200 kPa'],
      ['3', 'atm', 'pa', '3 atm = 3,03,975 Pa'],
      ['2', 'kpa', 'pa', '2 kPa = 2,000 Pa'],
      ['100', 'psi', 'kpa', '100 psi ≈ 689.4757293 kPa'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Energy Converter',
    path: '/energy-converter',
    screenshot: 'energy',
    clearLabel: 'Reset',
    cases: [
      ['2', 'kwh', 'j', '2 kWh = 72,00,000 J'],
      ['2', 'kcal', 'cal', '2 kcal = 2,000 cal'],
      ['5', 'cal', 'j', '5 cal = 20.92 J'],
      ['3', 'btu', 'j', '3 BTU ≈ 3,165.167558 J'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Frequency Converter',
    path: '/frequency-converter',
    screenshot: 'frequency',
    clearLabel: 'Reset',
    cases: [
      ['3', 'ghz', 'mhz', '3 GHz = 3,000 MHz'],
      ['2', 'khz', 'hz', '2 kHz = 2,000 Hz'],
      ['100', 'mhz', 'ghz', '100 MHz = 0.1 GHz'],
      ['1500', 'hz', 'khz', '1,500 Hz = 1.5 kHz'],
    ],
  });
  await checkConverter(browser, siteUrl, {
    title: 'Angle Converter',
    path: '/angle-converter',
    screenshot: 'angle',
    clearLabel: 'Reset',
    cases: [
      ['45', 'deg', 'grad', '45 deg = 50 grad'],
      ['-90', 'deg', 'grad', '-90 deg = -100 grad'],
      ['2', 'rad', 'deg', '2 rad ≈ 114.591559 deg'],
      ['200', 'grad', 'deg', '200 grad = 180 deg'],
    ],
  });
  for (const item of DATE_TIME_CHECKS) await item.run(browser, siteUrl);
  await checkRoutes(browser, siteUrl);
  await checkPlatform(browser, siteUrl);
} finally {
  await browser.close();
  await server?.close();
}

console.log(failures === 0 ? '\nAll browser checks passed.' : `\n${failures} browser check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
