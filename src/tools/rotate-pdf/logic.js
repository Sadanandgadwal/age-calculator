import { formatBytes } from '../../utils/imageFile.js';

export const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

export function applyTurn(turns, selected, delta, pageCount) {
  return Array.from({ length: pageCount }, (_, index) => normalizeAngle((turns[index] ?? 0) + (selected.has(index) ? delta : 0)));
}

export const countTurned = (turns) => turns.filter((turn) => turn !== 0).length;

export function getFacts(turns, blob) {
  return [
    { label: 'Pages rotated', value: `${countTurned(turns)} of ${turns.length}` },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
