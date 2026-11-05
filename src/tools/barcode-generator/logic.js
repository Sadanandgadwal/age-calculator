import JsBarcode from 'jsbarcode';
import { excerpt } from '../../utils/textStats.js';

export const FORMATS = [
  { id: 'CODE128', name: 'Code 128', hint: 'Letters, numbers and common symbols.' },
  { id: 'EAN13', name: 'EAN-13', hint: 'Enter 12 digits, and the check digit is added. Or enter all 13 to verify it.' },
  { id: 'UPC', name: 'UPC-A', hint: 'Enter 11 digits, and the check digit is added. Or enter all 12 to verify it.' },
  { id: 'CODE39', name: 'Code 39', hint: 'Capital letters, numbers, spaces and - . $ / + %.' },
  { id: 'ITF14', name: 'ITF-14', hint: 'Enter 13 digits, and the check digit is added. Or enter all 14 to verify it.' },
];

export const getFormat = (id) => FORMATS.find((format) => format.id === id);

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const DISPLAY = { width: 2, height: 90, margin: 12, fontSize: 18, background: '#ffffff', lineColor: '#000000' };

export function drawBarcode(target, value, formatId, scale = 1) {
  let isValid = true;
  JsBarcode(target, value, {
    ...DISPLAY,
    width: DISPLAY.width * scale,
    height: DISPLAY.height * scale,
    margin: DISPLAY.margin * scale,
    fontSize: DISPLAY.fontSize * scale,
    format: formatId,
    valid: (valid) => {
      isValid = valid;
    },
  });
  return isValid;
}

export function evaluate(value, formatId) {
  if (!value.trim()) return { error: null, svg: null };
  const invalid = { error: `This is not a valid ${getFormat(formatId).name} value. ${getFormat(formatId).hint}`, svg: null };
  if (formatId === 'CODE39' && value !== value.toUpperCase()) return invalid;
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  let isValid;
  try {
    isValid = drawBarcode(svg, value, formatId);
  } catch {
    return { error: 'This barcode could not be drawn in this browser.', svg: null };
  }
  if (!isValid) return invalid;
  svg.setAttribute('xmlns', SVG_NAMESPACE);
  return { error: null, svg: svg.outerHTML };
}

export const buildReport = (value, formatId, visual) => ({
  inputs: [
    { label: 'Value', value: excerpt(value) },
    { label: 'Format', value: getFormat(formatId).name },
  ],
  results: [{ label: 'Barcode', value: 'Valid' }],
  visual,
});
