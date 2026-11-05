import qrcode from 'qrcode-generator';
import { formatNumber } from '../../utils/formatResult.js';
import { excerpt } from '../../utils/textStats.js';

export const LEVELS = [
  { id: 'L', name: 'Low (7%)' },
  { id: 'M', name: 'Medium (15%)' },
  { id: 'Q', name: 'High (25%)' },
  { id: 'H', name: 'Highest (30%)' },
];

const QUIET_ZONE = 4;
const PNG_MODULE_PIXELS = 12;

const toByteString = (text) => String.fromCharCode(...new TextEncoder().encode(text));

export function createMatrix(text, level) {
  const code = qrcode(0, level);
  code.addData(toByteString(text), 'Byte');
  code.make();
  const size = code.getModuleCount();
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_unused, column) => code.isDark(row, column)));
}

export function evaluate(text, level) {
  if (!text) return { error: null, matrix: null };
  try {
    return { error: null, matrix: createMatrix(text, level) };
  } catch {
    return { error: 'This text is too long for a QR code. Please shorten it, or choose a lower error correction level.', matrix: null };
  }
}

export function getModulePath(matrix) {
  const parts = [];
  matrix.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) parts.push(`M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`);
    });
  });
  return parts.join('');
}

export const getViewSize = (matrix) => matrix.length + QUIET_ZONE * 2;

export function buildSvg(matrix) {
  const size = getViewSize(matrix);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="#fff" d="M0 0h${size}v${size}H0z"/><path fill="#000" d="${getModulePath(matrix)}"/></svg>`;
}

export function drawToCanvas(canvas, matrix) {
  const pixels = getViewSize(matrix) * PNG_MODULE_PIXELS;
  canvas.width = pixels;
  canvas.height = pixels;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, pixels, pixels);
  context.fillStyle = '#000';
  matrix.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) context.fillRect((x + QUIET_ZONE) * PNG_MODULE_PIXELS, (y + QUIET_ZONE) * PNG_MODULE_PIXELS, PNG_MODULE_PIXELS, PNG_MODULE_PIXELS);
    });
  });
}

export const buildReport = (text, level, matrix, visual) => ({
  inputs: [
    { label: 'Text or link', value: excerpt(text) },
    { label: 'Error correction', value: LEVELS.find(({ id }) => id === level).name },
  ],
  results: [{ label: 'Modules per side', value: formatNumber(matrix.length) }],
  visual,
});
