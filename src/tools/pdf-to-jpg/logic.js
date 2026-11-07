import { MAX_IMAGE_PIXELS, formatBytes } from '../../utils/imageFile.js';
import { formatPageRanges, parsePageRanges } from '../../utils/pageRanges.js';

export const RESOLUTIONS = [
  { id: '72', name: '72 DPI', dpi: 72 },
  { id: '150', name: '150 DPI', dpi: 150 },
  { id: '300', name: '300 DPI', dpi: 300 },
];

export const MAX_PAGES = 200;

export function choosePages(text, pageCount) {
  if (!text.trim()) return { pages: Array.from({ length: Math.min(pageCount, MAX_PAGES) }, (_, index) => index), isLimited: pageCount > MAX_PAGES };
  const parsed = parsePageRanges(text, pageCount);
  if (parsed.error) return parsed;
  if (parsed.pages.length > MAX_PAGES) return { error: `Please choose up to ${MAX_PAGES} pages at a time.` };
  return { pages: parsed.pages, isLimited: false };
}

export function scaleFor(dpi, widthPoints, heightPoints) {
  const scale = dpi / 72;
  const pixels = widthPoints * scale * heightPoints * scale;
  return pixels > MAX_IMAGE_PIXELS ? Math.sqrt(MAX_IMAGE_PIXELS / (widthPoints * heightPoints)) : scale;
}

export const imageName = (name, pageIndex) => `${(name ?? '').replace(/\.[^.]*$/, '').replace(/[^\p{L}\p{M}\p{N}._ -]/gu, '').trim() || 'document'}-page-${pageIndex + 1}.jpg`;

export function getFacts(pages, dpi, blob, isZip) {
  return [
    { label: 'Images', value: String(pages.length) },
    { label: 'Pages', value: formatPageRanges(pages) },
    { label: 'Resolution', value: `${dpi} DPI` },
    { label: isZip ? 'ZIP size' : 'Image size', value: formatBytes(blob.size) },
  ];
}
