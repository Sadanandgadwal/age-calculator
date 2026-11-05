export const PRESSURE_UNITS = [
  { id: 'psi', name: 'Pound per square inch', symbol: 'psi', factor: 6894.757293168361 },
  { id: 'bar', name: 'Bar', symbol: 'bar', factor: 100000 },
  { id: 'pa', name: 'Pascal', symbol: 'Pa', factor: 1 },
  { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', factor: 1000 },
  { id: 'atm', name: 'Standard atmosphere', symbol: 'atm', factor: 101325 },
];

export const EXAMPLE_PAIRS = [
  ['atm', 'pa'],
  ['atm', 'bar'],
  ['bar', 'kpa'],
  ['bar', 'psi'],
  ['psi', 'kpa'],
  ['atm', 'psi'],
];
