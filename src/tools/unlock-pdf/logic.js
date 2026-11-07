import { formatBytes } from '../../utils/imageFile.js';

export function describeSource(source) {
  return `${source.name}: ${source.pageCount} ${source.pageCount === 1 ? 'page' : 'pages'}, password protected`;
}

export function getFacts(pageCount, blob) {
  return [
    { label: 'Password', value: 'Removed' },
    { label: 'Pages', value: String(pageCount) },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
