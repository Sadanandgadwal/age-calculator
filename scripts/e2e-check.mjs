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
    await page.screenshot({ path: `${OUTPUT_DIR}/percentage-${viewport.width}.png`, fullPage: true });
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

async function checkConverter(browser, siteUrl, { title, path, screenshot, cases }) {
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
    await page.screenshot({ path: `${OUTPUT_DIR}/${screenshot}-${viewport.width}.png`, fullPage: true });

    await setDate(page, '#convert-value', '1000000000000');
    await page.select('#convert-from', cases[0][1]);
    await page.select('#convert-to', cases[0][2]);
    await settle();
    const longOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${label}: long results do not overflow`, !longOverflow);

    await clickButton(page, 'Clear');
    await settle();
    check(`${label}: clear empties the value`, (await page.$eval('#convert-value', (input) => input.value)) === '');
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

async function checkFlows(browser, siteUrl, { title, path, screenshot, requiredError, flows }) {
  console.log(`\n${title}`);
  for (const viewport of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const label = `${viewport.width}px`;
    const page = await browser.newPage();
    const problems = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.setViewport(viewport);
    await page.goto(new URL(path, siteUrl).href, { waitUntil: 'networkidle0' });

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
    await page.screenshot({ path: `${OUTPUT_DIR}/${screenshot}-${viewport.width}.png`, fullPage: true });

    await clickButton(page, 'Reset');
    await settle();
    check(`${label}: reset clears results`, await hasText(page, 'Your results will appear here'));
    check(`${label}: no console errors`, problems.length === 0, problems.join(' | '));
    await page.close();
  }
}

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
  check('home search finds tools by category', await hasText(page, '3 tools found'));

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
      ['1', 'ft', 'cm', '1 ft = 30.48 cm'],
      ['1', 'in', 'cm', '1 in = 2.54 cm'],
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
      { mode: 'Time after', inputs: { '#time-start': '23:30', '#time-a-hours': '1', '#time-a-minutes': '' }, answer: '12:30 AM' },
      { mode: 'Time before', inputs: { '#time-start': '00:30', '#time-a-hours': '1', '#time-a-minutes': '' }, answer: '11:30 PM' },
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
      { mode: 'Find the discount', inputs: { '#discount-a': '1000', '#discount-b': '750' }, answer: '25%' },
      { mode: 'Find the original price', inputs: { '#discount-a': '800', '#discount-b': '20' }, answer: '₹1,000.00' },
    ],
  });
  await checkRoutes(browser, siteUrl);
  await checkPlatform(browser, siteUrl);
} finally {
  await browser.close();
  await server?.close();
}

console.log(failures === 0 ? '\nAll browser checks passed.' : `\n${failures} browser check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
