import { checkNumber } from '../../utils/fieldValidation.js';
import { randomBelow, shuffle } from '../../utils/secureRandom.js';

const LOOK_ALIKE = /[O0Il1|]/g;
const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}<>?/|~',
};

export const OPTIONS = [
  { id: 'upper', label: 'Uppercase letters (A–Z)' },
  { id: 'lower', label: 'Lowercase letters (a–z)' },
  { id: 'digits', label: 'Numbers (0–9)' },
  { id: 'symbols', label: 'Symbols (!@#$…)' },
];

export const DEFAULTS = { length: '16', upper: true, lower: true, digits: true, symbols: true, skipLookAlike: false };

const LENGTH_MESSAGE = 'Please enter a length from 4 to 128.';

export function validate(settings) {
  const errors = {};
  const { value, error } = checkNumber(settings.length, { required: LENGTH_MESSAGE, min: 4, max: 128, whole: true, minMessage: LENGTH_MESSAGE, maxMessage: LENGTH_MESSAGE });
  if (error) errors.length = error;
  if (!OPTIONS.some(({ id }) => settings[id])) errors.options = 'Please choose at least one type of character.';
  return { errors, length: value };
}

const getPools = (settings) =>
  OPTIONS.filter(({ id }) => settings[id]).map(({ id }) => (settings.skipLookAlike ? SETS[id].replace(LOOK_ALIKE, '') : SETS[id]));

const pickFrom = (pool) => pool[randomBelow(pool.length)];

export function generatePassword(settings, length) {
  const pools = getPools(settings);
  const everything = pools.join('');
  const required = pools.map(pickFrom);
  const rest = Array.from({ length: length - required.length }, () => pickFrom(everything));
  return shuffle([...required, ...rest]).join('');
}

export function estimateStrength(settings, length) {
  const poolSize = getPools(settings).join('').length;
  const bits = Math.round(length * Math.log2(poolSize));
  let label = 'Very strong';
  if (bits < 40) label = 'Weak';
  else if (bits < 60) label = 'Fair';
  else if (bits < 80) label = 'Strong';
  return { bits, label };
}
