import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import { preloadToolPage } from './data/toolPages.js';
import { getToolByRoute } from './data/toolsRegistry.js';
import { getHeadTags, headTagsToHtml, escapeHtml } from './seo/headTags.js';
import { absoluteUrl, getAllPaths, getLastModified, getPageMeta } from './seo/pageMeta.js';
import { buildFaqSchema, toJsonLdScript } from './utils/structuredData.js';
import { buildLlmsText } from './seo/llmsText.js';

export { absoluteUrl, buildLlmsText, getAllPaths, getLastModified };

/** Renders one page for scripts/prerender.mjs. Used only at build time. */
export async function renderPage(path) {
  await preloadToolPage(path);

  const meta = getPageMeta(path);
  const schemas = [...meta.schemas];
  const content = await getToolByRoute(path)?.loadContent?.();
  if (content?.faqs) schemas.push(buildFaqSchema(content.faqs));

  return {
    indexable: meta.indexable,
    titleHtml: `<title>${escapeHtml(meta.title)}</title>`,
    headHtml: headTagsToHtml(getHeadTags(meta)) + schemas.map(toJsonLdScript).join(''),
    appHtml: renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    ),
  };
}
