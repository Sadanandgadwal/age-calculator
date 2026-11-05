export const WEIGHT_UNITS = [
  { id: 'kg', name: 'Kilogram', symbol: 'kg', factor: 1000 },
  { id: 'g', name: 'Gram', symbol: 'g', factor: 1 },
  { id: 'mg', name: 'Milligram', symbol: 'mg', factor: 0.001 },
  { id: 't', name: 'Metric tonne', symbol: 't', factor: 1000000 },
  { id: 'lb', name: 'Pound', symbol: 'lb', factor: 453.59237 },
  { id: 'oz', name: 'Ounce', symbol: 'oz', factor: 28.349523125 },
];

export const EXAMPLE_PAIRS = [
  ['kg', 'g'],
  ['g', 'mg'],
  ['t', 'kg'],
  ['kg', 'lb'],
  ['lb', 'g'],
  ['oz', 'g'],
];
