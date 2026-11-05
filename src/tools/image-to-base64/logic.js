import { formatBytes, formatName } from '../../utils/imageFile.js';

export const MAX_BYTES = 10 * 1024 * 1024;
export const DISPLAY_LIMIT = 20000;

export const FORMATS = [
  { id: 'datauri', name: 'Data URI' },
  { id: 'base64', name: 'Base64 only' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
];

export function formatOutput(dataUrl, formatId, alt = '') {
  if (formatId === 'base64') return dataUrl.slice(dataUrl.indexOf(',') + 1);
  if (formatId === 'html') return `<img src="${dataUrl}" alt="${alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}">`;
  if (formatId === 'css') return `background-image: url("${dataUrl}");`;
  return dataUrl;
}

export function previewOutput(text) {
  if (text.length <= DISPLAY_LIMIT) return { text, isPartial: false };
  return { text: `${text.slice(0, DISPLAY_LIMIT)}…`, isPartial: true };
}

export const altFromName = (name) => name.replace(/\.[^.]*$/, '');

export function getFacts(source, dataUrl) {
  const encoded = dataUrl.length - dataUrl.indexOf(',') - 1;
  return [
    { label: 'Format', value: formatName(source.type) },
    { label: 'Dimensions', value: `${source.width} × ${source.height} px` },
    { label: 'Image size', value: formatBytes(source.size) },
    { label: 'Base64 length', value: `${encoded.toLocaleString('en-US')} characters` },
    { label: 'Increase', value: `${Math.round((encoded / source.size - 1) * 100)}%` },
  ];
}
