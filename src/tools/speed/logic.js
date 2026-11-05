export const SPEED_UNITS = [
  { id: 'kmh', name: 'Kilometre per hour', symbol: 'km/h', factor: 1 },
  { id: 'mph', name: 'Mile per hour', symbol: 'mph', factor: 1.609344 },
  { id: 'ms', name: 'Metre per second', symbol: 'm/s', factor: 3.6 },
  { id: 'kn', name: 'Knot', symbol: 'kn', factor: 1.852 },
];

export const EXAMPLE_PAIRS = [
  ['ms', 'kmh'],
  ['mph', 'kmh'],
  ['kn', 'kmh'],
  ['kmh', 'mph'],
  ['kn', 'mph'],
  ['ms', 'mph'],
];
