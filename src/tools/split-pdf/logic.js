import { formatBytes } from '../../utils/imageFile.js';
import { groupsOf, parsePageRanges } from '../../utils/pageRanges.js';
import { pdfFilename } from '../../utils/pdfFile.js';

export const MODES = [
  { id: 'ranges', name: 'By ranges' },
  { id: 'every', name: 'Every N pages' },
  { id: 'each', name: 'Every page' },
];

const WHOLE = /^\d+$/;

export function planSplit(modeId, { ranges, every }, pageCount) {
  if (modeId === 'each') return { parts: groupsOf(pageCount, 1) };
  if (modeId === 'every') {
    const size = WHOLE.test(every.trim()) ? Number(every.trim()) : 0;
    if (size < 1 || size > pageCount) return { error: `Please enter a whole number from 1 to ${pageCount}.` };
    return { parts: groupsOf(pageCount, size) };
  }
  const pieces = ranges.split(',').map((piece) => piece.trim()).filter(Boolean);
  if (!pieces.length) return { error: 'Please enter at least one range, such as 1-3, 4-6.' };
  const parts = [];
  for (const piece of pieces) {
    const parsed = parsePageRanges(piece, pageCount);
    if (parsed.error) return { error: parsed.error };
    parts.push(parsed.pages);
  }
  return { parts };
}

export function partFilename(name, part) {
  const first = part[0] + 1;
  const last = part.at(-1) + 1;
  return pdfFilename(name, first === last ? `page-${first}` : `pages-${first}-${last}`);
}

export function describePlan(parts) {
  return `${parts.length} ${parts.length === 1 ? 'file' : 'files'}`;
}

export function getFacts(parts, blob) {
  return [
    { label: 'Files created', value: String(parts.length) },
    { label: 'Pages included', value: String(parts.reduce((sum, part) => sum + part.length, 0)) },
    { label: parts.length === 1 ? 'PDF size' : 'ZIP size', value: formatBytes(blob.size) },
  ];
}
