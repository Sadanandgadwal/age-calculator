import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

const OUT = process.env.PRINT_OUT ?? join(tmpdir(), 'toolnest-print');
const ONLY = process.env.PRINT_ONLY;
const A4 = { width: 595.28, height: 841.89 };
const CONTENT_WIDTH = 703;
const FORBIDDEN = ['Formula', 'Calculation steps', 'Copy results', 'Reset', 'Related', 'Frequently asked', 'All Tools', 'How it works', 'Advertisement', 'Your results will appear'];

const converter = (route, value, expected) => ({ route, steps: [['#convert-value', value]], expected });
const calc = (label = 'Calculate') => ['click', label];

const CASES = [
  { route: '/age-calculator', steps: [['#dob', '2000-01-15'], ['#asOf', '2026-11-04'], calc('Calculate Age')], expected: ['Age Calculator', '15 Jan 2000', '26', 'Years', 'Total days lived', 'Next birthday on'] },
  { route: '/marks-percentage-calculator', steps: [['#subject-1-name', 'Maths'], ['#subject-1-max', '100'], ['#subject-1-obtained', '80'], ['#subject-2-name', 'Science'], ['#subject-2-max', '100'], ['#subject-2-obtained', '70'], ['#subject-3-name', 'English'], ['#subject-3-max', '100'], ['#subject-3-obtained', '90'], calc()], expected: ['Marks by subject', 'Maths', '80', 'Science'] },
  { name: 'marks-overall', route: '/marks-percentage-calculator', steps: [['#subject-1-name', 'Hidden subject'], ['#subject-1-max', '100'], ['#subject-1-obtained', '80'], ['#subject-2-name', 'Science'], ['#subject-2-max', '100'], ['#subject-2-obtained', '70'], ['#subject-3-name', 'English'], ['#subject-3-max', '100'], ['#subject-3-obtained', '90'], calc(), ['click', 'Overall'], ['#overall-obtained', '450'], ['#overall-max', '500'], calc()], visibleOnly: true, expected: ['Overall marks', '90%', 'Marks lost'], absent: ['Hidden subject'] },
  { name: 'marks-target', route: '/marks-percentage-calculator', steps: [['click', 'Target'], ['#target-percent', '75'], ['#target-obtained', '60'], ['#target-max', '100'], ['#target-remaining', '100'], calc()], visibleOnly: true, expected: ['Target marks', 'Marks needed', '90'] },
  { route: '/percentage-calculator', steps: [['#percent-a', '20'], ['#percent-b', '500'], calc()], expected: ['20% of 500 is 100'] },
  converter('/kg-to-gram-converter', '2.5', ['2,500', 'Kilogram']),
  converter('/cm-to-feet-converter', '180', ['ft']),
  { route: '/date-calculator', steps: [['#date-end', '2026-12-31'], ['#date-start', '2026-01-01'], calc()], expected: ['1 Jan 2026', '31 Dec 2026', 'Weekend days', 'Years, months and days'] },
  { name: 'date-shift', route: '/date-calculator', steps: [['click', 'Add days'], ['#date-start', '2026-01-01'], ['#date-amount', '10'], calc()], expected: ['11 Jan 2026', 'Days to add', 'Calculation'] },
  { route: '/gst-calculator', steps: [['#gst-amount', '1000'], calc()], expected: ['Taxable amount', 'Final amount', 'CGST', 'Add GST'], absent: ['Not applicable'] },
  { route: '/emi-calculator', steps: [['#emi-amount', '500000'], ['#emi-rate', '9'], ['#emi-tenure', '5'], calc()], expected: ['Monthly EMI', 'Yearly schedule', 'Balance'] },
  { name: 'emi-30-years', route: '/emi-calculator', steps: [['#emi-amount', '5000000'], ['#emi-rate', '9'], ['#emi-tenure', '30'], calc()], expected: ['Yearly schedule', 'Balance'] },
  { name: 'emi-100-years', route: '/emi-calculator', steps: [['#emi-amount', '5000000'], ['#emi-rate', '9'], ['#emi-tenure', '100'], calc()], expected: ['Yearly schedule'], maxPages: 4 },
  { route: '/time-calculator', steps: [['click', 'Time between'], ['#time-start', '09:00'], ['#time-end', '17:30'], calc()], expected: ['Start time', 'End time', 'Duration', '8 hours'] },
  { route: '/discount-calculator', steps: [['#discount-a', '2000'], ['#discount-b', '25'], calc()], expected: ['Final price', 'You save', '25%'] },
  { route: '/bill-split-calculator', steps: [['#bill-amount', '1000'], ['#bill-people', '4'], calc()], expected: ['Each person pays', '250', 'Number of people'] },
  converter('/temperature-converter', '100', ['212', 'Fahrenheit']),
  converter('/area-converter', '100', ['Conversion rate']),
  converter('/volume-converter', '10', ['Conversion rate']),
  converter('/data-storage-converter', '2', ['MB']),
  converter('/speed-converter', '100', ['mph']),
  converter('/time-unit-converter', '2', ['120']),
  converter('/pressure-converter', '100', ['bar']),
  converter('/energy-converter', '100', ['Conversion rate']),
  converter('/frequency-converter', '2', ['2,000']),
  converter('/angle-converter', '180', ['rad']),
  { route: '/countdown-timer', steps: [['#countdown-name', 'Launch day'], ['#countdown-date', '2099-01-01'], ['#countdown-time', '10:30'], calc('Start')], expected: ['Launch day', '1 Jan 2099', '10:30', 'Days', 'Seconds'] },
  { route: '/stopwatch', steps: [calc('Start'), ['wait', 250], calc('Lap'), ['wait', 250], calc('Lap'), calc('Pause')], expected: ['Elapsed time', 'Lap records', 'Lap time'] },
  { name: 'stopwatch-many-laps', route: '/stopwatch', steps: [calc('Start'), ...Array.from({ length: 80 }, () => calc('Lap')), calc('Pause')], expected: ['Lap records'], maxPages: 3 },
  { route: '/time-zone-converter', steps: [['#tz-date', '2026-06-15'], ['#tz-time', '12:00'], calc()], expected: ['From time zone', 'To time zone', 'Converted time', 'Converted date', 'Time difference'] },
  { route: '/business-days-calculator', steps: [['#biz-start', '2026-01-01'], ['#biz-end', '2026-01-31'], ['#biz-holiday', '2026-01-26'], calc('Add holiday'), calc()], expected: ['Working days', 'Weekend days', '26 Jan 2026', 'Holidays excluded'] },
  { route: '/day-of-week-calculator', steps: [['#dow-date', '2026-11-04'], calc()], expected: ['Wednesday', '4 Nov 2026', 'Day of the year'] },
  { route: '/pomodoro-timer', steps: [calc('Start'), calc('Pause')], expected: ['Focus sessions completed', 'Focus session', '25 minutes', 'Short break'] },
  { route: '/leap-year-checker', steps: [['#leap-year', '2024'], calc()], expected: ['2024', 'Yes', 'Divides by 400'] },
  { route: '/week-number-calculator', steps: [['#week-date', '2026-11-04'], calc()], expected: ['ISO week number', 'Week start', 'Week end', '45'] },
  { route: '/work-hours-calculator', steps: [['#work-in', '09:00'], ['#work-out', '18:30'], ['#work-break', '30'], calc()], expected: ['Clock-in', 'Clock-out', 'Break', 'Net working hours', 'Overtime', '9 h 0 min'] },
  { route: '/unix-timestamp-converter', steps: [['#unix-timestamp', '1700000000'], calc()], expected: ['1700000000', 'UTC', 'Local', '14 Nov 2023'] },
  { route: '/word-counter', steps: [['#word-text', 'One two three. Four five!']], expected: ['Words', 'Sentences', 'Reading Time', 'One two three'] },
  { route: '/character-counter', steps: [['#char-text', 'Hello there'], ['#char-limit', '160']], expected: ['Character limit', '149 left of 160', 'Letters', 'Hello there'] },
  { route: '/line-counter', steps: [['#line-text', 'one\n\ntwo']], expected: ['Total lines', 'Blank lines', 'Longest Line'] },
  { route: '/reading-time-calculator', steps: [['#read-text', 'word word word word word']], expected: ['Reading speed', 'Reading time', 'Speaking time'] },
  { route: '/case-converter', steps: [['#case-text', 'hello big world'], ['click', 'camelCase']], expected: ['Converted to', 'camelCase', 'helloBigWorld'] },
  { route: '/text-reverser', steps: [['#reverse-text', 'Hello there']], expected: ['Reversed by', 'Reversed text', 'ereht olleH'] },
  { route: '/remove-duplicate-lines', steps: [['#dedupe-text', 'pear\nplum\npear']], expected: ['Lines kept', 'Lines removed', 'Cleaned list', 'plum'] },
  { route: '/remove-extra-spaces', steps: [['#spaces-text', 'one    two']], expected: ['Characters removed', 'Cleaned text', 'one two'] },
  { route: '/find-replace-text', steps: [['#replace-text', 'one two one'], ['#replace-find', 'one'], ['#replace-with', 'three'], ['click', 'Replace all']], expected: ['Find', 'Replace with', 'Replacements made', 'three two three'] },
  { route: '/text-sorter', steps: [['#sort-text', 'pear\napple\nplum']], expected: ['Order', 'A to Z', 'Sorted lines', 'apple'] },
  { route: '/slug-generator', steps: [['#slug-text', 'Hello Big World']], expected: ['Title', 'Separator', 'hello-big-world'] },
  { route: '/lorem-ipsum-generator', steps: [], expected: ['Paragraphs', 'Words', 'Placeholder text', 'Lorem ipsum dolor'] },
  { route: '/random-number-generator', steps: [['#random-min', '7'], ['#random-max', '7'], ['click', 'Generate']], expected: ['Lowest number', 'Highest number', 'Random number', '7'] },
  { route: '/password-generator', noPrint: true, steps: [['click', 'Generate']], expected: [] },
  { route: '/qr-code-generator', steps: [['#qr-text', 'https://example.com']], expected: ['Text or link', 'https://example.com', 'Error correction', 'Modules per side'] },
  { route: '/json-formatter', steps: [['#json-format-text', '{"name":"Asha","age":30}']], expected: ['Indent', '2 spaces', 'Formatted JSON', '"name": "Asha"'] },
  { route: '/json-validator', steps: [['#json-validate-text', '{"a":[1,2]}']], expected: ['Valid JSON', 'Objects', 'Deepest Level'] },
  { route: '/json-minifier', steps: [['#json-minify-text', '{ "a" : 1 }']], expected: ['Saved', 'Minified size', 'Minified JSON', '{"a":1}'] },
  { route: '/base64-encoder-decoder', steps: [['#base64-text', 'Hello']], expected: ['Action', 'Encode', 'SGVsbG8='] },
];

const failures = [];
const check = (label, ok, detail = '') => {
  if (!ok) failures.push(`${label}${detail ? `: ${detail}` : ''}`);
};

const registry = readFileSync(new URL('../src/data/toolsRegistry.js', import.meta.url), 'utf8');
for (const [, route] of registry.matchAll(/route: '([^']+)'/g)) {
  check(`every tool has a print case: ${route}`, CASES.some((item) => item.route === route));
}

async function setField(page, selector, value) {
  await page.waitForSelector(selector);
  await page.$eval(
    selector,
    (element, next) => {
      const protos = { SELECT: HTMLSelectElement, TEXTAREA: HTMLTextAreaElement };
      const proto = (protos[element.tagName] ?? HTMLInputElement).prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, next);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    value,
  );
}

async function clickButton(page, text) {
  const clicked = await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll('button, [role="tab"], [role="radio"]')].filter((node) => node.textContent.trim() === label && node.offsetParent !== null);
    const button = buttons.at(-1);
    button?.click();
    return Boolean(button);
  }, text);
  if (!clicked) throw new Error(`No button named ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 30));
}

async function run(browser, siteUrl, item) {
  const name = item.name ?? item.route.slice(1);
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__prints = 0;
    window.print = () => {
      window.__prints += 1;
    };
  });
  await page.goto(`${siteUrl.replace(/\/$/, '')}${item.route}`, { waitUntil: 'networkidle0' });

  for (const step of item.steps) {
    if (step[0] === 'click') await clickButton(page, step[1]);
    else if (step[0] === 'wait') await new Promise((resolve) => setTimeout(resolve, step[1]));
    else await setField(page, step[0], step[1]);
  }

  if (item.noPrint) {
    const names = await page.$$eval('button', (buttons) => buttons.map((button) => button.textContent.trim()));
    check(`${name}: offers no Print button`, !names.includes('Print') && names.includes('Copy results'));
    console.log(`  ${name}: no print`);
    await page.close();
    return;
  }

  await clickButton(page, 'Print');
  check(`${name}: Print button calls the browser`, (await page.evaluate(() => window.__prints)) === 1);

  await page.setViewport({ width: CONTENT_WIDTH, height: 1000 });
  await page.emulateMediaType('print');
  const layout = await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeprint'));
    const reports = document.querySelectorAll('.print-report');
    const limit = reports[0]?.getBoundingClientRect().right ?? 0;
    const clipped = [...document.querySelectorAll('.print-report *')]
      .filter((node) => !node.closest('svg') && (node.getBoundingClientRect().right > limit + 1 || node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).display !== 'inline'))
      .map((node) => node.className || node.tagName);
    const rootHidden = getComputedStyle(document.getElementById('root')).display === 'none';
    window.dispatchEvent(new Event('afterprint'));
    return { count: reports.length, clipped, rootHidden };
  });
  await new Promise((resolve) => setTimeout(resolve, 30));
  check(`${name}: exactly one report`, layout.count === 1, String(layout.count));
  check(`${name}: nothing else prints`, layout.rootHidden);
  check(`${name}: no clipped content`, layout.clipped.length === 0, layout.clipped.join(','));
  await page.emulateMediaType(null);

  const file = join(OUT, `${name}.pdf`);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false });
  const left = await page.evaluate(() => {
    window.dispatchEvent(new Event('afterprint'));
    return new Promise((resolve) => setTimeout(() => resolve(document.querySelectorAll('.print-report').length), 30));
  });
  check(`${name}: report removed after printing`, left === 0, String(left));

  const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
  const pages = Number(info.match(/Pages:\s+(\d+)/)[1]);
  const [, width, height] = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
  check(`${name}: A4`, Math.abs(width - A4.width) < 1 && Math.abs(height - A4.height) < 1, `${width}x${height}`);
  check(`${name}: at most ${item.maxPages ?? 1} page(s)`, pages <= (item.maxPages ?? 1), String(pages));

  const lower = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' }).toLowerCase();
  for (const wanted of ['ToolNest', 'Generated on', ...item.expected]) check(`${name}: shows ${wanted}`, lower.includes(wanted.toLowerCase()));
  for (const banned of [...FORBIDDEN, ...(item.absent ?? [])]) check(`${name}: hides ${banned}`, !lower.includes(banned.toLowerCase()));
  check(`${name}: no page errors`, errors.length === 0, errors.join('; '));

  console.log(`${pages === 1 ? ' ' : '*'} ${name}: ${pages} page(s)`);
  await page.close();
}

mkdirSync(OUT, { recursive: true });
const server = await preview({ preview: { port: 4179 }, logLevel: 'silent' });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const siteUrl = server.resolvedUrls.local[0];

for (const item of CASES) {
  if (ONLY && !(item.name ?? item.route).includes(ONLY)) continue;
  try {
    await run(browser, siteUrl, item);
  } catch (error) {
    failures.push(`${item.name ?? item.route}: ${error.message}`);
  }
}

await browser.close();
await server.close();
console.log(failures.length ? `\nFAILED ${failures.length}:\n${failures.join('\n')}` : `\nAll print checks passed. PDFs in ${OUT}`);
process.exit(failures.length ? 1 : 0);
