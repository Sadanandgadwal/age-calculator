export const DPI = 300;
const MM_PER_INCH = 25.4;
const MIN_MM = 20;
const MAX_MM = 100;
const DECIMAL = /^\d+(\.\d+)?$/;

export const PRESETS = [
  { id: 'india', name: 'India', label: 'India passport', width: 35, height: 45, head: null },
  { id: 'us', name: 'USA', label: 'US passport', width: 51, height: 51, head: [25, 35] },
  { id: 'uk', name: 'UK', label: 'UK passport', width: 35, height: 45, head: [29, 34] },
  { id: 'canada', name: 'Canada', label: 'Canada passport', width: 50, height: 70, head: [31, 36] },
  { id: 'schengen', name: 'Schengen', label: 'Schengen visa', width: 35, height: 45, head: [32, 36] },
  { id: 'custom', name: 'Custom', label: 'Custom size', width: null, height: null, head: null },
];

export const PAPERS = [
  { id: '4x6', name: '4 × 6 in', width: 101.6, height: 152.4 },
  { id: 'a4', name: 'A4', width: 210, height: 297 },
];

export const getPreset = (id) => PRESETS.find((preset) => preset.id === id);
export const getPaper = (id) => PAPERS.find((paper) => paper.id === id);
export const mmToPx = (mm, dpi = DPI) => Math.round((mm / MM_PER_INCH) * dpi);
const formatMm = (value) => `${Number(value.toFixed(1))}`;

export function readCustomSize(width, height) {
  const errors = {};
  const read = (text, field) => {
    const trimmed = text.trim();
    const value = DECIMAL.test(trimmed) ? Number(trimmed) : NaN;
    if (!(value >= MIN_MM && value <= MAX_MM)) errors[field] = `Please enter a size from ${MIN_MM} to ${MAX_MM} mm.`;
    return value;
  };
  const size = { width: read(width, 'width'), height: read(height, 'height') };
  return errors.width || errors.height ? { errors } : { errors, size };
}

export function sheetLayout(paper, photo, margin = 4, gap = 2) {
  const columns = Math.max(0, Math.floor((paper.width - 2 * margin + gap) / (photo.width + gap)));
  const rows = Math.max(0, Math.floor((paper.height - 2 * margin + gap) / (photo.height + gap)));
  const usedWidth = columns * photo.width + Math.max(0, columns - 1) * gap;
  const usedHeight = rows * photo.height + Math.max(0, rows - 1) * gap;
  const left = (paper.width - usedWidth) / 2;
  const top = (paper.height - usedHeight) / 2;
  const positions = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) positions.push({ x: left + column * (photo.width + gap), y: top + row * (photo.height + gap) });
  }
  return { columns, rows, count: positions.length, positions };
}

export function headGuide(size, head) {
  if (!head) return null;
  const share = (head[0] + head[1]) / 2 / size.height;
  return { top: Math.max(0.04, (1 - share) / 2 - 0.05), height: share, width: Math.min(0.9, (share * size.height * 0.72) / size.width) };
}

export function setJpegDpi(bytes, dpi = DPI) {
  const isJfif = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff && bytes[3] === 0xe0 && String.fromCharCode(...bytes.subarray(6, 11)) === 'JFIF\0';
  if (!isJfif) return bytes;
  const output = bytes.slice();
  output[13] = 1;
  output[14] = dpi >> 8;
  output[15] = dpi & 0xff;
  output[16] = dpi >> 8;
  output[17] = dpi & 0xff;
  return output;
}

export function isLowResolution(crop, size) {
  return crop.width < mmToPx(size.width) * 0.75;
}

export function getFacts(preset, size, crop, paper, count) {
  const facts = [
    { label: 'Photo size', value: `${formatMm(size.width)} × ${formatMm(size.height)} mm` },
    { label: 'Pixels', value: `${mmToPx(size.width)} × ${mmToPx(size.height)} px at ${DPI} DPI` },
  ];
  if (preset.head) facts.push({ label: 'Head, chin to crown', value: `${preset.head[0]} to ${preset.head[1]} mm` });
  facts.push({ label: 'Print sheet', value: `${count} photos on ${paper.name}` });
  facts.push({ label: 'Taken from your photo', value: `${crop.width} × ${crop.height} px` });
  return facts;
}

export const PRINT_NOTE = 'Print at 100% or Actual size, not Fit to page, so the photos keep their exact size.';
export const RULES_NOTE = 'Rules change and vary by office, so check the official requirements before you apply. This tool does not guarantee that a photo will be accepted.';

export function buildReport(preset, size, count) {
  return {
    inputs: [
      { label: 'Document', value: preset.label },
      { label: 'Photo size', value: `${formatMm(size.width)} × ${formatMm(size.height)} mm` },
    ],
    results: [{ label: 'Photos on this page', value: String(count) }],
    notes: [PRINT_NOTE, RULES_NOTE],
  };
}
