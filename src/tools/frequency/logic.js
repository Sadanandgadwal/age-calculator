export const FREQUENCY_UNITS = [
  { id: 'hz', name: 'Hertz', symbol: 'Hz', factor: 1 },
  { id: 'khz', name: 'Kilohertz', symbol: 'kHz', factor: 1000 },
  { id: 'mhz', name: 'Megahertz', symbol: 'MHz', factor: 1000000 },
  { id: 'ghz', name: 'Gigahertz', symbol: 'GHz', factor: 1000000000 },
];

export const EXAMPLE_PAIRS = [
  ['khz', 'hz'],
  ['mhz', 'khz'],
  ['ghz', 'mhz'],
  ['ghz', 'hz'],
  ['hz', 'khz', 500],
  ['mhz', 'ghz', 2400],
];
