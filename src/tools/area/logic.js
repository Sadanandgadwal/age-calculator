export const AREA_UNITS = [
  { id: 'sqft', name: 'Square foot', symbol: 'sq ft', factor: 0.09290304 },
  { id: 'sqm', name: 'Square metre', symbol: 'sq m', factor: 1 },
  { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.8564224 },
  { id: 'hectare', name: 'Hectare', symbol: 'ha', factor: 10000 },
  { id: 'cent', name: 'Cent', symbol: 'cent', factor: 40.468564224 },
  { id: 'sqyd', name: 'Square yard', symbol: 'sq yd', factor: 0.83612736 },
];

export const EXAMPLE_PAIRS = [
  ['acre', 'sqft'],
  ['acre', 'cent'],
  ['cent', 'sqft'],
  ['hectare', 'acre'],
  ['sqyd', 'sqft'],
  ['sqm', 'sqft'],
];
