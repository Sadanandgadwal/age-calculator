import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { formatNumber } from '../../utils/formatResult.js';
import { getWords } from '../../utils/textStats.js';

const BLOCKED_TAGS = ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'object', 'embed', 'video', 'audio', 'source', 'track', 'link', 'meta', 'base'];
const BLOCKED_ATTRIBUTES = ['style', 'srcset', 'background', 'poster', 'formaction'];
const SAFE_IMAGE = /^data:image\//i;
let hooksReady = false;

function prepareHooks() {
  if (hooksReady) return;
  hooksReady = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IMG' && !node.hasAttribute('alt')) node.setAttribute('alt', '');
    if (node.tagName === 'IMG' && !SAFE_IMAGE.test(node.getAttribute('src') ?? '')) {
      node.removeAttribute('src');
      node.setAttribute('data-blocked', 'true');
    }
  });
}

export function renderMarkdown(text) {
  prepareHooks();
  const html = marked.parse(text, { async: false, gfm: true });
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: BLOCKED_TAGS, FORBID_ATTR: BLOCKED_ATTRIBUTES });
}

export function evaluate(text) {
  if (!text.trim()) return null;
  const html = renderMarkdown(text);
  return { html, words: getWords(text).length, blockedImages: (html.match(/data-blocked="true"/g) ?? []).length };
}

export const blockedNote = ({ blockedImages }) =>
  blockedImages > 0 ? `${formatNumber(blockedImages)} remote ${blockedImages === 1 ? 'image was' : 'images were'} not loaded, as fetching them would tell another server about your visit. The alt text is shown instead.` : null;

export function buildReport(result, visual) {
  const note = blockedNote(result);
  return {
    results: [{ label: 'Words', value: formatNumber(result.words) }],
    visual,
    notes: note ? [note] : null,
  };
}
