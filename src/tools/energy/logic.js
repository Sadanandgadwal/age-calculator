export const ENERGY_UNITS = [
  { id: 'j', name: 'Joule', symbol: 'J', factor: 1 },
  { id: 'cal', name: 'Calorie', symbol: 'cal', factor: 4.184 },
  { id: 'kcal', name: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
  { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', factor: 3600000 },
  { id: 'btu', name: 'British thermal unit', symbol: 'BTU', factor: 1055.05585262 },
];

export const EXAMPLE_PAIRS = [
  ['cal', 'j'],
  ['kcal', 'cal'],
  ['kcal', 'j'],
  ['kwh', 'j'],
  ['btu', 'j'],
  ['kwh', 'btu'],
];
