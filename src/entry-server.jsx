import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { FAQS, USEFUL_INFO } from './content/faqs.js';
import { buildFaqSchema, toJsonLdScript } from './utils/structuredData.js';

/** Used only at build time by scripts/prerender.mjs. */
export function renderPage() {
  return {
    appHtml: renderToString(<App />),
    faqScript: toJsonLdScript(buildFaqSchema([...USEFUL_INFO, ...FAQS])),
  };
}
