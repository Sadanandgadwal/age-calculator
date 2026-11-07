import { checkImageFile, formatBytes, formatName, outputFilename } from '../../utils/imageFile.js';

export const FORMATS = [
  { id: 'image/png', name: 'PNG', extension: 'png', lossy: false },
  { id: 'image/jpeg', name: 'JPEG', extension: 'jpg', lossy: true },
  { id: 'image/webp', name: 'WebP', extension: 'webp', lossy: true },
  { id: 'image/avif', name: 'AVIF', extension: 'avif', lossy: true },
];

export function canEncode(type) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      if (!canvas.getContext('2d') || !canvas.toBlob) return resolve(false);
      canvas.toBlob((blob) => resolve(blob?.type === type), type);
    } catch {
      resolve(false);
    }
  });
}

export const MAX_FILES = 20;
export const DEFAULT_QUALITY = 90;

export const getFormat = (id) => FORMATS.find((format) => format.id === id) ?? FORMATS[0];

export function convertedName(name, formatId) {
  const { extension } = getFormat(formatId);
  return outputFilename(name, 'converted', 'image/png').replace(/\.png$/, `.${extension}`);
}

export function uniqueNames(names) {
  const seen = new Map();
  return names.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : name.replace(/(\.[^.]+)$/, `-${count + 1}$1`);
  });
}

export function pickFiles(current, incoming) {
  const accepted = [];
  const problems = [];
  for (const file of incoming) {
    const problem = checkImageFile(file);
    if (problem) problems.push(`${file.name}: ${problem}`);
    else if (current.length + accepted.length >= MAX_FILES) problems.push(`${file.name}: You can convert up to ${MAX_FILES} images at a time.`);
    else accepted.push(file);
  }
  return { accepted, problems };
}

export function describeResult(item) {
  const change = item.blob.size - item.size;
  const percent = item.size ? Math.round((Math.abs(change) / item.size) * 100) : 0;
  const sizeChange = change === 0 ? 'same size' : `${percent}% ${change < 0 ? 'smaller' : 'larger'}`;
  return `${formatName(item.type)} ${formatBytes(item.size)} → ${getFormat(item.blob.type).name} ${formatBytes(item.blob.size)} (${sizeChange}), ${item.width} × ${item.height} px`;
}

export const transparencyNote = (items, formatId) =>
  formatId === 'image/jpeg' && items.some((item) => item.type === 'image/png' || item.type === 'image/webp' || item.type === 'image/gif' || item.type === 'image/avif')
    ? 'JPEG has no transparency, so any transparent areas are filled with white.'
    : null;
