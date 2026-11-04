import { siteConfig } from '../config/site.js';
import { CATEGORIES, getCategory } from '../data/toolCategories.js';
import { TOOLS, getToolByRoute } from '../data/toolsRegistry.js';
import { getToolsInCategory } from '../utils/toolSearch.js';

const SITE_IMAGE = '/og-site.png';
const HOME_CRUMB = { name: 'Home', path: '/' };
const SCHEMA_CONTEXT = 'https://schema.org';
const author = { '@type': 'Person', name: siteConfig.author.name, url: siteConfig.author.url };

export const absoluteUrl = (path) => `${siteConfig.url}${path}`;
export const normalizePath = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

function breadcrumbSchema(breadcrumbs) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

function collectionSchema(name, description, path, tools) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: absoluteUrl(tool.route),
      })),
    },
  };
}

function directoryMeta({ path, name, title, description, tools }) {
  const meta = simplePageMeta({ path, name, title, description, indexable: tools.length > 0 });
  return { ...meta, schemas: [...meta.schemas, collectionSchema(name, description, path, tools)] };
}

function toolMeta(tool) {
  const primaryCategory = getCategory(tool.categories[0]);
  const breadcrumbs = [
    HOME_CRUMB,
    { name: primaryCategory.name, path: primaryCategory.route },
    { name: tool.name, path: tool.route },
  ];
  const image = tool.seo.image ?? SITE_IMAGE;

  return {
    title: tool.seo.title,
    description: tool.seo.description,
    path: tool.route,
    image,
    indexable: true,
    breadcrumbs,
    schemas: [
      {
        '@context': SCHEMA_CONTEXT,
        '@type': 'WebApplication',
        name: tool.name,
        url: absoluteUrl(tool.route),
        description: tool.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: 'en',
        isAccessibleForFree: true,
        image: absoluteUrl(image),
        featureList: tool.seo.featureList,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author,
      },
      breadcrumbSchema(breadcrumbs),
    ],
  };
}

function simplePageMeta({ path, name, title, description, indexable = true }) {
  const breadcrumbs = [HOME_CRUMB, { name, path }];
  return {
    title,
    description,
    path,
    image: SITE_IMAGE,
    indexable,
    breadcrumbs,
    schemas: [breadcrumbSchema(breadcrumbs)],
  };
}

const homeMeta = () => ({
  title: `${siteConfig.name} – Free Online Calculators & Everyday Tools`,
  description: `${siteConfig.tagline} Everything runs in your browser, with no sign-up required.`,
  path: '/',
  image: SITE_IMAGE,
  indexable: true,
  breadcrumbs: [],
  schemas: [
    {
      '@context': SCHEMA_CONTEXT,
      '@type': 'WebSite',
      name: siteConfig.name,
      url: absoluteUrl('/'),
      inLanguage: 'en',
      author,
    },
  ],
});

const STATIC_PAGES = {
  '/all-tools': () =>
    directoryMeta({
      path: '/all-tools',
      name: 'All Tools',
      title: 'All Free Online Tools | ToolNest',
      description: 'Browse every free ToolNest calculator and converter. Search by name or filter by category.',
      tools: TOOLS,
    }),
  '/about': () =>
    simplePageMeta({
      path: '/about',
      name: 'About',
      title: 'About ToolNest – Free Everyday Online Tools',
      description: 'ToolNest is a growing collection of free online tools that run in your browser, with no sign-up required.',
    }),
  '/contact': () =>
    simplePageMeta({
      path: '/contact',
      name: 'Contact',
      title: 'Contact ToolNest',
      description: 'Get in touch with ToolNest to report a problem, suggest a tool or ask a question.',
      // Stays out of search results until there is a real address to show.
      indexable: Boolean(siteConfig.contactEmail),
    }),
};

function categoryMeta(category) {
  return directoryMeta({
    path: category.route,
    name: category.name,
    title: category.seo.title,
    description: category.seo.description,
    tools: getToolsInCategory(TOOLS, category.id),
  });
}

const notFoundMeta = () => ({
  title: `Page Not Found | ${siteConfig.name}`,
  description: 'This page could not be found. Browse all tools to find what you need.',
  path: null,
  image: SITE_IMAGE,
  indexable: false,
  breadcrumbs: [],
  schemas: [],
});

/** Everything search engines and the breadcrumb need to know about a URL. */
export function getPageMeta(pathname) {
  const path = normalizePath(pathname);
  if (path === '/') return homeMeta();
  if (STATIC_PAGES[path]) return STATIC_PAGES[path]();

  const tool = getToolByRoute(path);
  if (tool) return toolMeta(tool);

  const category = CATEGORIES.find(({ route }) => route === path);
  if (category) return categoryMeta(category);

  return notFoundMeta();
}

/** Every real page on the site, excluding the 404 page. */
export const getAllPaths = () => [
  '/',
  ...Object.keys(STATIC_PAGES),
  ...CATEGORIES.map(({ route }) => route),
  ...TOOLS.map(({ route }) => route),
];
