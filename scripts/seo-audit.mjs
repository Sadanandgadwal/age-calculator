#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = resolve('dist');
const failures = [];
const fail = (page, message) => failures.push(`${page}: ${message}`);

const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const attr = (tag, name) => decode(tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '');
const meta = (html, key, value) => {
  const tag = html.match(new RegExp(`<meta[^>]*${key}="${value}"[^>]*>`))?.[0];
  return tag ? attr(tag, 'content') : null;
};

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'assets' || name === 'pdfjs' || name === 'ocr' ? [] : htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const routeOf = (file) => {
  const path = '/' + relative(DIST, file).replace(/\\/g, '/');
  if (path === '/index.html') return '/';
  return path.endsWith('/index.html') ? path.slice(0, -'/index.html'.length) : path;
};

const resolves = (path) => {
  if (path === '/') return true;
  const clean = path.replace(/[?#].*$/, '');
  return [clean, `${clean}/index.html`, `${clean}.html`].some((candidate) => {
    const file = join(DIST, candidate);
    return existsSync(file) && statSync(file).isFile();
  });
};

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
const origin = new URL(sitemapLocs[0]).origin;
const sitemapPaths = new Set(sitemapLocs.map((loc) => new URL(loc).pathname));
if (lastmods.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) fail('sitemap.xml', 'invalid lastmod date');

const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail('robots.txt', 'missing sitemap line');

const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8');
if (!llms.startsWith('# ')) fail('llms.txt', 'missing H1');
for (const [, url] of llms.matchAll(/\]\(([^)]+)\)/g)) {
  if (!sitemapLocs.includes(url)) fail('llms.txt', `links to ${url}, which is not in the sitemap`);
}

const titles = new Map();
const descriptions = new Map();
const linkedFrom = new Map();
const pages = htmlFiles(DIST).filter((file) => !file.endsWith('404.html'));

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const route = routeOf(file);
  const robotsMeta = meta(html, 'name', 'robots') ?? '';
  const indexable = !robotsMeta.includes('noindex');

  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '').trim();
  const description = meta(html, 'name', 'description') ?? '';
  const canonical = attr(html.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0] ?? '', 'href');

  if (indexable && !sitemapPaths.has(route)) fail(route, 'indexable page missing from the sitemap');
  if (!indexable && sitemapPaths.has(route)) fail(route, 'noindex page listed in the sitemap');
  if (canonical !== `${origin}${route === '/' ? '/' : route}`) fail(route, `canonical is "${canonical}"`);

  if (!title) fail(route, 'missing title');
  else if (title.length > 60) fail(route, `title is ${title.length} characters`);
  if (description.length < 110 || description.length > 165) fail(route, `description is ${description.length} characters`);
  if (indexable) {
    titles.set(title, [...(titles.get(title) ?? []), route]);
    descriptions.set(description, [...(descriptions.get(description) ?? []), route]);
  }

  if (route.endsWith('.html')) continue;

  for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!meta(html, 'property', property)) fail(route, `missing ${property}`);
  }
  for (const name of ['twitter:title', 'twitter:description', 'twitter:image']) {
    if (!meta(html, 'name', name)) fail(route, `missing ${name}`);
  }
  const ogImage = meta(html, 'property', 'og:image');
  if (ogImage && !resolves(new URL(ogImage).pathname)) fail(route, `og:image ${ogImage} not found`);

  const body = html.slice(html.indexOf('<div id="root">'));
  const h1s = body.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) fail(route, `${h1s} h1 headings`);

  for (const img of body.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt="/.test(img)) fail(route, `image without alt: ${img.slice(0, 80)}`);
  }

  for (const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      const data = JSON.parse(block[1]);
      if (data['@context'] !== 'https://schema.org' || !data['@type']) fail(route, 'structured data without context or type');
      if (data['@type'] === 'FAQPage' && !data.mainEntity?.length) fail(route, 'empty FAQPage');
    } catch {
      fail(route, 'structured data is not valid JSON');
    }
  }

  for (const [, href] of body.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const target = decode(href);
    if (!target.startsWith('/') || target.startsWith('//')) continue;
    const path = target.replace(/[?#].*$/, '') || '/';
    if (!resolves(path)) fail(route, `broken link ${target}`);
    if (path !== route) linkedFrom.set(path, (linkedFrom.get(path) ?? 0) + 1);
  }
}

for (const [title, routes] of titles) if (routes.length > 1) fail(routes.join(', '), `share the title "${title}"`);
for (const [, routes] of descriptions) if (routes.length > 1) fail(routes.join(', '), 'share a description');
for (const path of sitemapPaths) if (path !== '/' && !linkedFrom.get(path)) fail(path, 'no page links to it');

const BUDGETS = { js: 150 * 1024, css: 15 * 1024 };
const homeHtml = readFileSync(join(DIST, 'index.html'), 'utf8');
for (const [, href] of homeHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(js|css))"/g)) {
  const type = href.endsWith('.css') ? 'css' : 'js';
  const size = gzipSync(readFileSync(join(DIST, href))).length;
  if (size > BUDGETS[type]) fail(href, `${Math.round(size / 1024)} kB compressed, over the ${BUDGETS[type] / 1024} kB budget`);
}

if (failures.length) {
  console.log(`SEO audit: ${failures.length} problems\n${failures.map((line) => `  FAIL  ${line}`).join('\n')}`);
  process.exit(1);
}
console.log(`SEO audit passed: ${pages.length} pages, ${sitemapPaths.size} in the sitemap`);
