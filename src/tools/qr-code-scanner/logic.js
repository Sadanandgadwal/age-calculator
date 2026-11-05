import jsQR from 'jsqr';
import { excerpt } from '../../utils/textStats.js';

export const MODES = [
  { id: 'image', name: 'From an image' },
  { id: 'camera', name: 'With my camera' },
];

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 2000;
const LINK_WARNING = 'Check the address before you open it, as a QR code can point anywhere.';

export const decodeFrame = ({ data, width, height }) => jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })?.data ?? null;

export function fitSize(width, height, maxSide = MAX_SIDE) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function checkFile(file) {
  if (!file.type.startsWith('image/')) return 'Please choose an image file, such as a PNG or JPG.';
  if (file.size > MAX_FILE_BYTES) return 'This image is larger than 25 MB. Please choose a smaller one.';
  return null;
}

export function readLink(text) {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function describeCameraError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'Camera access was blocked. Allow it in your browser settings, or scan from an image instead.';
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return 'No camera was found. Scan from an image instead.';
  if (error?.name === 'NotReadableError') return 'Your camera is being used by another app. Close it and try again.';
  return 'The camera could not be started. Scan from an image instead.';
}

export const getLinkWarning = () => LINK_WARNING;

export function buildReport(text, source) {
  const link = readLink(text);
  return {
    inputs: [{ label: 'Scanned from', value: source }],
    results: [{ label: 'Type', value: link ? 'Web link' : 'Text' }],
    text: { title: 'Scanned content', value: excerpt(text), mono: true },
    notes: link ? [LINK_WARNING] : null,
  };
}
