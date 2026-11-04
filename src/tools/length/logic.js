import { convertUnits, formatQuantity } from '../../utils/unitConversion.js';

export const LENGTH_UNITS = [
  { id: 'cm', name: 'Centimeter', symbol: 'cm', factor: 1 },
  { id: 'm', name: 'Meter', symbol: 'm', factor: 100 },
  { id: 'km', name: 'Kilometer', symbol: 'km', factor: 100000 },
  { id: 'mm', name: 'Millimeter', symbol: 'mm', factor: 0.1 },
  { id: 'ft', name: 'Feet', symbol: 'ft', factor: 30.48 },
  { id: 'in', name: 'Inch', symbol: 'in', factor: 2.54 },
  { id: 'yd', name: 'Yard', symbol: 'yd', factor: 91.44 },
  { id: 'mi', name: 'Mile', symbol: 'mi', factor: 160934.4 },
];

export const EXAMPLE_PAIRS = [
  ['cm', 'm', 100],
  ['ft', 'cm'],
  ['in', 'cm'],
  ['km', 'm'],
  ['cm', 'ft'],
  ['mi', 'km'],
];

const INCH = LENGTH_UNITS.find(({ id }) => id === 'in');
const MAX_READABLE_INCHES = 1e12;

export function formatFeetAndInches(totalInches) {
  const hundredths = Math.round(totalInches * 100);
  const feet = Math.floor(hundredths / 1200);
  const inches = (hundredths - feet * 1200) / 100;
  return `${formatQuantity(feet)} ft ${formatQuantity(inches)} in`;
}

export function getFeetAndInchesDetails({ value, from, to }) {
  if (to.id !== 'ft' && to.id !== 'in') return [];
  const totalInches = convertUnits(value, from, INCH);
  if (totalInches >= MAX_READABLE_INCHES) return [];
  return [{ label: 'Feet and Inches', value: formatFeetAndInches(totalInches) }];
}
