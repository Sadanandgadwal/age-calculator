export const TIME_UNITS = [
  { id: 's', name: 'Second', symbol: 's', factor: 1 },
  { id: 'min', name: 'Minute', symbol: 'min', factor: 60 },
  { id: 'h', name: 'Hour', symbol: 'h', factor: 3600 },
  { id: 'day', name: 'Day', symbol: 'd', factor: 86400 },
  { id: 'week', name: 'Week', symbol: 'wk', factor: 604800 },
  { id: 'year', name: 'Year', symbol: 'yr', factor: 31557600 },
];

export const EXAMPLE_PAIRS = [
  ['min', 's'],
  ['h', 'min'],
  ['day', 'h'],
  ['week', 'day'],
  ['year', 'day'],
  ['year', 's'],
];

export const YEAR_CONVENTION = '1 year = 365.25 days';

export const getYearDetails = ({ from, to }) =>
  from.id === 'year' || to.id === 'year' ? [{ label: 'Year Convention', value: YEAR_CONVENTION }] : [];
