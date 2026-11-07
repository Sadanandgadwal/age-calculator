import { formatDecimal } from '../../utils/number.js';

const series = (prefix, sizes, group) => sizes.map(([width, height], index) => ({ id: `${prefix}${index}`.toLowerCase(), name: `${prefix}${index}`, width, height, group }));

export const PAPERS = [
  ...series('A', [[841, 1189], [594, 841], [420, 594], [297, 420], [210, 297], [148, 210], [105, 148], [74, 105], [52, 74], [37, 52], [26, 37]], 'ISO A series'),
  ...series('B', [[1000, 1414], [707, 1000], [500, 707], [353, 500], [250, 353], [176, 250], [125, 176], [88, 125], [62, 88], [44, 62], [31, 44]], 'ISO B series'),
  { id: 'c4', name: 'C4 envelope', width: 229, height: 324, group: 'Envelopes' },
  { id: 'c5', name: 'C5 envelope', width: 162, height: 229, group: 'Envelopes' },
  { id: 'c6', name: 'C6 envelope', width: 114, height: 162, group: 'Envelopes' },
  { id: 'dl', name: 'DL envelope', width: 110, height: 220, group: 'Envelopes' },
  { id: 'letter', name: 'Letter', width: 215.9, height: 279.4, group: 'North American' },
  { id: 'legal', name: 'Legal', width: 215.9, height: 355.6, group: 'North American' },
  { id: 'tabloid', name: 'Tabloid', width: 279.4, height: 431.8, group: 'North American' },
  { id: 'executive', name: 'Executive', width: 184.15, height: 266.7, group: 'North American' },
];

export const GROUPS = [...new Set(PAPERS.map(({ group }) => group))];
export const DPIS = ['72', '96', '150', '300', '600'];
export const ORIENTATIONS = [
  { id: 'portrait', name: 'Portrait' },
  { id: 'landscape', name: 'Landscape' },
];

export const getPaper = (id) => PAPERS.find((paper) => paper.id === id) ?? PAPERS[4];

const MM_PER_INCH = 25.4;
const pair = (width, height, digits) => `${formatDecimal(Number(width.toFixed(digits)))} × ${formatDecimal(Number(height.toFixed(digits)))}`;

export function measure(paperId, orientation, dpi) {
  const paper = getPaper(paperId);
  const [width, height] = orientation === 'landscape' ? [paper.height, paper.width] : [paper.width, paper.height];
  const inches = [width / MM_PER_INCH, height / MM_PER_INCH];
  const pixels = inches.map((value) => Math.round(value * dpi));
  return {
    paper,
    orientation,
    dpi,
    mm: `${pair(width, height, 1)} mm`,
    cm: `${pair(width / 10, height / 10, 2)} cm`,
    inches: `${inches.map((value) => formatDecimal(Number(value.toFixed(2)))).join(' × ')} in`,
    points: `${pair(inches[0] * 72, inches[1] * 72, 2)} pt`,
    pixels: `${pixels.map((value) => value.toLocaleString('en-IN')).join(' × ')} px`,
    megapixels: formatDecimal(Number(((pixels[0] * pixels[1]) / 1e6).toFixed(2))),
    area: `${((width * height) / 100).toLocaleString('en-IN', { maximumFractionDigits: 1 })} cm²`,
  };
}

export function getRows(result) {
  return [
    { label: 'Millimetres', value: result.mm },
    { label: 'Inches', value: result.inches },
    { label: `Pixels at ${result.dpi} DPI`, value: result.pixels },
    { label: 'Centimetres', value: result.cm },
    { label: 'Points', value: result.points },
    { label: 'Megapixels', value: `${result.megapixels} MP` },
    { label: 'Area', value: result.area },
  ];
}

export const titleOf = ({ paper, orientation }) => `${paper.name}, ${orientation}`;

export const buildResultText = (result) => [titleOf(result), ...getRows(result).map(({ label, value }) => `${label}: ${value}`)].join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Paper', value: result.paper.name },
      { label: 'Orientation', value: result.orientation === 'portrait' ? 'Portrait' : 'Landscape' },
      { label: 'Resolution', value: `${result.dpi} DPI` },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(3),
  };
}
