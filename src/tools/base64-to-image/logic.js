import { decodeBase64Bytes } from '../../utils/base64.js';
import { formatBytes, formatName } from '../../utils/imageFile.js';

export const MAX_CHARACTERS = 20_000_000;

const NOT_IMAGE = 'This decodes to data, but it is not a supported image.';
const SVG_START = /^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype svg[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i;

const startsWith = (bytes, signature, offset = 0) => signature.every((value, index) => bytes[offset + index] === value);
const ascii = (text) => Array.from(text, (character) => character.charCodeAt(0));

const TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

export function detectImageType(bytes) {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(bytes, ascii('GIF87a')) || startsWith(bytes, ascii('GIF89a'))) return 'image/gif';
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return 'image/webp';
  if (startsWith(bytes, ascii('BM')) && bytes.length > 14) return 'image/bmp';
  if (startsWith(bytes, [0, 0, 1, 0]) && bytes.length > 6) return 'image/x-icon';
  if (startsWith(bytes, ascii('ftypavif'), 4) || startsWith(bytes, ascii('ftypavis'), 4)) return 'image/avif';
  if (SVG_START.test(new TextDecoder().decode(bytes.subarray(0, 2048)))) return 'image/svg+xml';
  return null;
}

export function parseImageText(text) {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'Please paste some Base64 text.' };
  if (trimmed.length > MAX_CHARACTERS) return { error: 'This text is too long. The limit is 20 million characters.' };

  let body = trimmed;
  let declared = null;
  if (/^data:/i.test(trimmed)) {
    const match = trimmed.match(/^data:([^;,]*)((?:;[^;,]*)*),/i);
    if (!match) return { error: 'This data URI is not complete.' };
    if (!/;base64$/i.test(match[2])) return { error: 'This data URI is not Base64. Only Base64 data URIs can be read here.' };
    declared = match[1].toLowerCase() || null;
    body = trimmed.slice(match[0].length);
  }

  const { error, bytes } = decodeBase64Bytes(body);
  if (error) return { error };
  if (bytes.length === 0) return { error: 'There is no image data in this text.' };

  const type = detectImageType(bytes);
  if (!type) return { error: NOT_IMAGE };
  return { bytes, type, extension: TYPES[type], declaredMismatch: Boolean(declared && declared !== type && !(declared === 'image/jpg' && type === 'image/jpeg') && !(declared === 'image/vnd.microsoft.icon' && type === 'image/x-icon')) };
}

export function getFacts(parsed, size) {
  const facts = [
    { label: 'Format', value: formatName(parsed.type) },
    { label: 'File size', value: formatBytes(parsed.bytes.length) },
  ];
  return size ? [facts[0], { label: 'Dimensions', value: `${size.width} × ${size.height} px` }, facts[1]] : facts;
}
