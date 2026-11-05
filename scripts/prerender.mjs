#!/usr/bin/env node
/**
 * Writes a complete HTML file for every page, plus 404.html and sitemap.xml, so
 * search engines and social previews get each page's content and tags without
 * running JavaScript.
 *
 * The browser then replaces this HTML with an identical live app (see main.jsx).
 * Today's date only exists in the browser, so a fresh render avoids any mismatch
 * with the date captured at build time.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const DIST = resolve('dist');
const SSR_DIR = resolve('.ssr-build');
const ROOT_MARKER = '<div id="root"></div>';
const HEAD_MARKER = '<!--page-head-->';
const TITLE_PATTERN = /<title>.*?<\/title>/;
const NOT_FOUND_PATH = '/__not-found__';

const { absoluteUrl, getAllPaths, renderPage } = await import(
  pathToFileURL(resolve(SSR_DIR, 'entry-server.js')).href
);

const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');
for (const marker of [ROOT_MARKER, HEAD_MARKER]) {
  if (!template.includes(marker)) throw new Error(`Prerender failed: ${marker} is missing from index.html`);
}

// Loading the font early stops the text from visibly changing as the page appears.
const font = readdirSync(resolve(DIST, 'assets')).find((file) => file.endsWith('.woff2'));
const fontPreload = font
  ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />`
  : '';

async function buildPage(path, outputFile) {
  const page = await renderPage(path);
  const html = template
    .replace(TITLE_PATTERN, () => page.titleHtml)
    .replace(HEAD_MARKER, () => fontPreload + page.headHtml)
    .replace(ROOT_MARKER, () => `<div id="root">${page.appHtml}</div>`);

  const file = resolve(DIST, outputFile);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  return page;
}

const today = new Date().toISOString().slice(0, 10);
const sitemapEntries = [];

for (const path of getAllPaths()) {
  const output = path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
  const { indexable } = await buildPage(path, output);
  if (indexable) {
    sitemapEntries.push(`  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);
  }
}

await buildPage(NOT_FOUND_PATH, '404.html');

const privacyFile = resolve(DIST, 'privacy.html');
writeFileSync(
  privacyFile,
  readFileSync(privacyFile, 'utf8').replace('</head>', () => `<link rel="canonical" href="${absoluteUrl('/privacy.html')}" /></head>`),
);

writeFileSync(
  resolve(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`,
);
rmSync(SSR_DIR, { recursive: true, force: true });

console.log(`Prerendered ${getAllPaths().length} pages and 404.html (${sitemapEntries.length} in the sitemap)`);
