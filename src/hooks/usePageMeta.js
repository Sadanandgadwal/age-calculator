import { useEffect } from 'react';
import { getHeadTags } from '../seo/headTags.js';
import { getPageMeta } from '../seo/pageMeta.js';

function applyHeadTag({ tag, selector, attributes, value }) {
  let element = document.head.querySelector(selector);

  if (value === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement(tag);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, attributeValue]) => element.setAttribute(name, attributeValue));
}

/** Keeps the document's title and SEO tags correct as the user moves between pages. */
export function usePageMeta(pathname) {
  useEffect(() => {
    const meta = getPageMeta(pathname);
    const previousPath = document.documentElement.dataset.metaPath;

    document.title = meta.title;
    getHeadTags(meta).forEach(applyHeadTag);

    // Prerendered structured data describes the page that first loaded, so it goes after navigating.
    if (previousPath && previousPath !== pathname) {
      document.head.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove());
    }
    document.documentElement.dataset.metaPath = pathname;
  }, [pathname]);
}
