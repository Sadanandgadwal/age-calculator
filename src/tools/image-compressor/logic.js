import { flattensTransparency, formatBytes, formatName } from '../../utils/imageFile.js';

export const FORMATS = [
  { id: 'image/jpeg', name: 'JPEG' },
  { id: 'image/webp', name: 'WebP' },
];

export const DEFAULT_QUALITY = 75;
export const MIN_QUALITY = 10;
export const MAX_QUALITY = 95;

export function describeSaving(originalSize, compressedSize) {
  const saved = originalSize - compressedSize;
  if (saved <= 0) return { isSmaller: false, value: `${formatBytes(-saved)} larger` };
  const percent = (saved / originalSize) * 100;
  return { isSmaller: true, value: `${formatBytes(saved)} (${percent < 1 ? percent.toFixed(1) : Math.round(percent)}%)` };
}

export function getFacts(source, blob, type) {
  const saving = describeSaving(source.size, blob.size);
  return [
    { label: 'Original', value: `${formatBytes(source.size)}, ${formatName(source.type)}` },
    { label: 'Compressed', value: `${formatBytes(blob.size)}, ${formatName(type)}` },
    { label: saving.isSmaller ? 'Saved' : 'Change', value: saving.value },
    { label: 'Dimensions', value: `${source.width} × ${source.height} px` },
  ];
}

export function getNote(source, blob, type) {
  if (blob.size >= source.size) return 'This version is not smaller than your original, so it is better to keep your original. You can also try a lower quality or another format.';
  if (flattensTransparency(source.type, type)) return 'JPEG does not support transparency, so any transparent areas become white. Choose WebP to keep them.';
  if (source.type === 'image/gif') return 'Only the first frame of an animated GIF is kept.';
  return null;
}
