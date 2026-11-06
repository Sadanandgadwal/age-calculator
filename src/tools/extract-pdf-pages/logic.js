import { formatBytes } from '../../utils/imageFile.js';
import { formatPageRanges } from '../../utils/pageRanges.js';

export const sortedPages = (selected) => [...selected].sort((first, second) => first - second);

export function getFacts(pages, pageCount, blob) {
  return [
    { label: 'Pages extracted', value: `${pages.length} of ${pageCount}` },
    { label: 'Pages', value: formatPageRanges(pages) },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
