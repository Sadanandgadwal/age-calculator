import { absoluteUrl } from './pageMeta.js';

const ROBOTS_INDEX = 'index, follow, max-snippet:-1, max-image-preview:large';
const ROBOTS_NOINDEX = 'noindex, follow';

const metaTag = (attribute, name, content) => ({
  tag: 'meta',
  selector: `meta[${attribute}="${name}"]`,
  attributes: { [attribute]: name, content },
  value: content,
});

/**
 * The tags that differ from page to page. A null value means the page should not
 * have that tag. Prerendering and in-app navigation both use this list, so they agree.
 */
export function getHeadTags(meta) {
  const url = meta.path ? absoluteUrl(meta.path) : null;
  const image = absoluteUrl(meta.image);

  return [
    metaTag('name', 'description', meta.description),
    metaTag('name', 'robots', meta.indexable ? ROBOTS_INDEX : ROBOTS_NOINDEX),
    {
      tag: 'link',
      selector: 'link[rel="canonical"]',
      attributes: { rel: 'canonical', href: url },
      value: url,
    },
    metaTag('property', 'og:title', meta.title),
    metaTag('property', 'og:description', meta.description),
    metaTag('property', 'og:url', url),
    metaTag('property', 'og:image', image),
    metaTag('property', 'og:image:alt', meta.title),
    metaTag('name', 'twitter:title', meta.title),
    metaTag('name', 'twitter:description', meta.description),
    metaTag('name', 'twitter:image', image),
  ];
}

export const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function headTagsToHtml(tags) {
  return tags
    .filter(({ value }) => value !== null)
    .map(({ tag, attributes }) => {
      const text = Object.entries(attributes).map(([key, value]) => `${key}="${escapeHtml(value)}"`);
      return `<${tag} ${text.join(' ')} />`;
    })
    .join('');
}
