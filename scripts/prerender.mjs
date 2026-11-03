#!/usr/bin/env node
/**
 * Writes the rendered page into dist/index.html, so search engines and social
 * previews get the full content without running JavaScript.
 *
 * The browser then replaces this HTML with an identical live app (see main.jsx).
 * Today's date only exists in the browser, so a fresh render avoids any mismatch
 * with the date captured at build time.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const DIST = resolve('dist');
const SSR_DIR = resolve('.ssr-build');
const ROOT_MARKER = '<div id="root"></div>';

const { renderPage } = await import(pathToFileURL(resolve(SSR_DIR, 'entry-server.js')).href);
const { appHtml, faqScript } = renderPage();

const indexPath = resolve(DIST, 'index.html');
const template = readFileSync(indexPath, 'utf8');
if (!template.includes(ROOT_MARKER)) {
  throw new Error(`Prerender failed: ${ROOT_MARKER} was not found in dist/index.html`);
}

// Loading the font early stops the text from visibly changing as the page appears.
const font = readdirSync(resolve(DIST, 'assets')).find((file) => file.endsWith('.woff2'));
const fontPreload = font
  ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />`
  : '';

const html = template
  .replace(ROOT_MARKER, () => `<div id="root">${appHtml}</div>`)
  .replace('</head>', () => `${fontPreload}${faqScript}</head>`);

writeFileSync(indexPath, html);
rmSync(SSR_DIR, { recursive: true, force: true });

console.log(`Prerendered dist/index.html (${Math.round(html.length / 1024)} kB)`);
