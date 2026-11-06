import { describe, expect, it } from 'vitest';
import { getHeadTags, headTagsToHtml } from './headTags.js';
import { absoluteUrl, getAllPaths, getPageMeta, normalizePath } from './pageMeta.js';
import { CATEGORIES, getCategory } from '../data/toolCategories.js';
import { TOOLS } from '../data/toolsRegistry.js';

describe('tool registry', () => {
  it('gives every tool unique identifiers and the required fields', () => {
    expect(new Set(TOOLS.map(({ id }) => id)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map(({ route }) => route)).size).toBe(TOOLS.length);

    for (const tool of TOOLS) {
      expect(tool.route).toMatch(/^\/[a-z0-9-]+$/);
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.icon).toBeTruthy();
      expect(tool.keywords.length).toBeGreaterThan(0);
      expect(tool.addedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof tool.featured).toBe('boolean');
      expect(typeof tool.load).toBe('function');
      expect(tool.seo.title).toBeTruthy();
      expect(tool.seo.description).toBeTruthy();
      tool.categories.forEach((id) => expect(getCategory(id), `${tool.id}: ${id}`).toBeTruthy());
    }
  });

  it('can load every tool page', async () => {
    for (const tool of TOOLS) {
      const page = await tool.load();
      expect(typeof page.default).toBe('function');
    }
  }, 60000);

  it('keeps the Age Calculator at its route', () => {
    expect(TOOLS.find(({ id }) => id === 'age-calculator').route).toBe('/age-calculator');
  });
});

describe('getPageMeta', () => {
  it('gives every page a unique title, description and canonical path', () => {
    const pages = getAllPaths().map(getPageMeta);

    for (const field of ['title', 'description', 'path']) {
      const values = pages.map((page) => page[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });

  it('keeps titles and descriptions a suitable length for search results', () => {
    for (const path of [...getAllPaths(), '/no-such-page']) {
      const { title, description } = getPageMeta(path);
      expect(title.length, `${path} title`).toBeLessThanOrEqual(70);
      expect(description.length, `${path} description`).toBeGreaterThanOrEqual(50);
      expect(description.length, `${path} description`).toBeLessThanOrEqual(165);
    }
  });

  it.each([
    ['/age-calculator', 'Age Calculator – Calculate Your Exact Age Online'],
    ['/marks-percentage-calculator', 'Marks & Percentage Calculator – Calculate Exam Results'],
    ['/percentage-calculator', 'Free Percentage Calculator – Calculate Percentages Online'],
    ['/kg-to-gram-converter', 'KG to Gram Converter – Free Weight Conversion Tool'],
    ['/cm-to-feet-converter', 'CM to Feet Converter – Free Length Conversion Tool'],
    ['/date-calculator', 'Date Calculator – Calculate Days Between Dates'],
    ['/gst-calculator', 'GST Calculator India – Calculate CGST, SGST and IGST'],
  ])('%s uses its required title', (path, title) => {
    expect(getPageMeta(path).title).toBe(title);
  });

  it('lists a directory page\'s tools in its structured data', () => {
    const collection = getPageMeta('/finance').schemas.find((schema) => schema['@type'] === 'CollectionPage');
    const names = collection.mainEntity.itemListElement.map(({ name }) => name);
    expect(names).toEqual(TOOLS.filter((tool) => tool.categories.includes('finance')).map(({ name }) => name));
    expect(getPageMeta('/all-tools').schemas[1].mainEntity.itemListElement).toHaveLength(TOOLS.length);
  });

  it('includes the required routes', () => {
    expect(getAllPaths()).toEqual(
      expect.arrayContaining(['/', '/all-tools', '/calculators', '/converters', '/date-time', '/finance', '/about', '/contact', '/age-calculator']),
    );
  });

  it('treats a trailing slash as the same page', () => {
    expect(normalizePath('/about/')).toBe('/about');
    expect(normalizePath('/')).toBe('/');
    expect(getPageMeta('/age-calculator/').path).toBe('/age-calculator');
  });

  it('describes a tool page with its registry data', () => {
    const meta = getPageMeta('/age-calculator');

    expect(meta.title).toBe('Age Calculator – Calculate Your Exact Age Online');
    expect(meta.indexable).toBe(true);
    expect(meta.breadcrumbs.map(({ name }) => name)).toEqual(['Home', 'Calculators', 'Age Calculator']);
    expect(meta.schemas.map((schema) => schema['@type'])).toEqual(['WebApplication', 'BreadcrumbList']);
    expect(meta.schemas[0].author.url).toBe('https://sadanandgadwal.com');
  });

  it('keeps categories with no tools out of search results', () => {
    for (const category of CATEGORIES) {
      const hasTools = TOOLS.some((tool) => tool.categories.includes(category.id));
      expect(getPageMeta(category.route).indexable, category.id).toBe(hasTools);
    }
  });

  it('keeps the Contact page out of search results until it has an address', () => {
    expect(getPageMeta('/contact').indexable).toBe(false);
  });

  it('marks unknown pages as not found', () => {
    const meta = getPageMeta('/no-such-page');
    expect(meta.title).toContain('Page Not Found');
    expect(meta.path).toBeNull();
    expect(meta.indexable).toBe(false);
    expect(meta.schemas).toEqual([]);
  });
});

describe('head tags', () => {
  it('points canonical and social URLs at the page itself', () => {
    const html = headTagsToHtml(getHeadTags(getPageMeta('/about')));
    expect(html).toContain(`<link rel="canonical" href="${absoluteUrl('/about')}" />`);
    expect(html).toContain(`<meta property="og:url" content="${absoluteUrl('/about')}" />`);
    expect(html).toContain('content="index, follow');
  });

  it('leaves out canonical and URL tags on the not-found page, and blocks indexing', () => {
    const html = headTagsToHtml(getHeadTags(getPageMeta('/no-such-page')));
    expect(html).not.toContain('canonical');
    expect(html).not.toContain('og:url');
    expect(html).toContain('content="noindex, follow"');
  });

  it('escapes special characters', () => {
    const html = headTagsToHtml(getHeadTags({ ...getPageMeta('/about'), title: 'A & B "C" <D>' }));
    expect(html).toContain('A &amp; B &quot;C&quot; &lt;D&gt;');
  });
});
