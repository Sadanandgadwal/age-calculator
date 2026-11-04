import { evaluateConversion } from '../../utils/unitConversion.js';

export const ANGLE_UNITS = [
  { id: 'deg', name: 'Degree', symbol: 'deg', factor: 1 },
  { id: 'rad', name: 'Radian', symbol: 'rad', factor: 180 / Math.PI },
  { id: 'grad', name: 'Gradian', symbol: 'grad', factor: 0.9 },
];

export const EXAMPLE_PAIRS = [
  ['deg', 'grad', 90],
  ['deg', 'grad', 360],
  ['deg', 'rad', 180],
  ['deg', 'rad', 90],
  ['rad', 'deg'],
  ['grad', 'deg'],
];

export const evaluateAngle = (text, fromId, toId, units = ANGLE_UNITS) =>
  evaluateConversion(text, fromId, toId, units, { allowNegative: true });
