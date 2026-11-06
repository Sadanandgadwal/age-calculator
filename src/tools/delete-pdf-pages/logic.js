import { formatBytes } from '../../utils/imageFile.js';
import { formatPageRanges } from '../../utils/pageRanges.js';

export function remainingPages(pageCount, selected) {
  return Array.from({ length: pageCount }, (_, index) => index).filter((index) => !selected.has(index));
}

export function checkDeletion(pageCount, selected) {
  if (selected.size === 0) return 'Select the pages you want to delete.';
  if (selected.size >= pageCount) return 'A PDF needs at least one page, so keep at least one.';
  return null;
}

export function getFacts(selected, remaining, blob) {
  return [
    { label: 'Pages deleted', value: formatPageRanges([...selected]) },
    { label: 'Pages left', value: String(remaining.length) },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
