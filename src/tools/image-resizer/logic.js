import { MAX_IMAGE_PIXELS, MAX_IMAGE_SIDE, flattensTransparency, formatBytes, formatName } from '../../utils/imageFile.js';

export const MODES = [
  { id: 'pixels', name: 'Pixels' },
  { id: 'percent', name: 'Percent' },
];

const MAX_PERCENT = 400;
const WHOLE_NUMBER = /^\d+$/;

function readWhole(text) {
  const trimmed = text.trim();
  return WHOLE_NUMBER.test(trimmed) ? Number(trimmed) : null;
}

export function linkedSize(changed, otherOriginal, changedOriginal) {
  const value = readWhole(changed);
  if (!value) return '';
  return String(Math.max(1, Math.round((value / changedOriginal) * otherOriginal)));
}

export function validateSize(source, { modeId, width, height, percent }) {
  const errors = {};
  if (modeId === 'percent') {
    const value = readWhole(percent);
    if (!value || value > MAX_PERCENT) {
      errors.percent = `Please enter a whole percent from 1 to ${MAX_PERCENT}.`;
      return { errors };
    }
    const size = { width: Math.max(1, Math.round((source.width * value) / 100)), height: Math.max(1, Math.round((source.height * value) / 100)) };
    return checkLimits(size, errors, 'percent');
  }

  const parsedWidth = readWhole(width);
  const parsedHeight = readWhole(height);
  if (!parsedWidth) errors.width = 'Please enter a whole number of pixels.';
  if (!parsedHeight) errors.height = 'Please enter a whole number of pixels.';
  if (errors.width || errors.height) return { errors };
  return checkLimits({ width: parsedWidth, height: parsedHeight }, errors, 'width');
}

function checkLimits(size, errors, field) {
  if (size.width > MAX_IMAGE_SIDE || size.height > MAX_IMAGE_SIDE || size.width * size.height > MAX_IMAGE_PIXELS) {
    errors[field] = 'This size is too large. The limit is 12,000 pixels on a side, and 40 megapixels in total.';
    return { errors };
  }
  return { errors, size };
}

export function getFacts(source, size, blob, type) {
  return [
    { label: 'Original', value: `${source.width} × ${source.height} px, ${formatBytes(source.size)}` },
    { label: 'Resized', value: `${size.width} × ${size.height} px, ${formatBytes(blob.size)}` },
    { label: 'Format', value: formatName(type) },
  ];
}

export function getNote(source, size, type) {
  const notes = [];
  if (size.width > source.width || size.height > source.height) notes.push('Making an image larger cannot add detail, so it may look soft.');
  if (Math.abs(size.width / size.height - source.width / source.height) > 0.01) notes.push('These proportions differ from your original, so the picture will look stretched.');
  if (flattensTransparency(source.type, type)) notes.push('Transparent areas become white.');
  if (type !== source.type && source.type !== 'image/png') notes.push(`${formatName(source.type)} cannot be saved here, so this was saved as ${formatName(type)}.`);
  return notes.join(' ') || null;
}
