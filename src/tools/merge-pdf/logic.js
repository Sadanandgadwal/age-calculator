import { formatBytes } from '../../utils/imageFile.js';

export const describeFile = (item) => `${item.pageCount} ${item.pageCount === 1 ? 'page' : 'pages'} · ${formatBytes(item.size)}`;

export function getFacts(items, blob) {
  const pages = items.reduce((sum, item) => sum + item.pageCount, 0);
  return [
    { label: 'Files merged', value: String(items.length) },
    { label: 'Total pages', value: pages.toLocaleString('en-US') },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}

export const orderKey = (items) => items.map((item) => item.id).join(',');
