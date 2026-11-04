export const VOLUME_UNITS = [
  { id: 'l', name: 'Litre', symbol: 'L', factor: 1 },
  { id: 'ml', name: 'Millilitre', symbol: 'mL', factor: 0.001 },
  { id: 'usgal', name: 'US gallon', symbol: 'US gal', factor: 3.785411784 },
  { id: 'ukgal', name: 'UK gallon', symbol: 'UK gal', factor: 4.54609 },
  { id: 'cup', name: 'US cup', symbol: 'US cup', factor: 0.2365882365 },
  { id: 'm3', name: 'Cubic metre', symbol: 'm³', factor: 1000 },
];

export const EXAMPLE_PAIRS = [
  ['l', 'ml'],
  ['m3', 'l'],
  ['usgal', 'l'],
  ['ukgal', 'l'],
  ['cup', 'ml'],
  ['ukgal', 'usgal'],
];
