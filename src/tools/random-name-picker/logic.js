import { checkNumber } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { getLines } from '../../utils/textStats.js';
import { shuffle } from '../../utils/secureRandom.js';

export function readNames(text, mergeRepeats = false) {
  const names = getLines(text).map((line) => line.trim()).filter(Boolean);
  return mergeRepeats ? [...new Set(names)] : names;
}

export function validate({ text, countText, mergeRepeats }) {
  const names = readNames(text, mergeRepeats);
  const errors = {};
  if (names.length === 0) errors.text = 'Please enter at least one name.';

  const message = 'Please enter how many to pick, 1 or more.';
  const { value, error } = checkNumber(countText, { required: message, min: 1, whole: true, minMessage: message });
  if (error) errors.count = error;
  else if (names.length > 0 && value > names.length) errors.count = `The list only has ${formatNumber(names.length)} ${names.length === 1 ? 'name' : 'names'}.`;

  return { errors, names, count: value };
}

export const pickNames = (names, count, mix = shuffle) => mix(names).slice(0, count);

export const buildResultText = ({ winners }) => winners.join('\n');

export const buildReport = ({ winners, total }) => ({
  inputs: [
    { label: 'Names in the list', value: formatNumber(total) },
    { label: 'How many to pick', value: formatNumber(winners.length) },
  ],
  results: winners.length === 1 ? [{ label: 'Winner', value: winners[0] }] : [{ label: 'Winners picked', value: formatNumber(winners.length) }],
  text: winners.length === 1 ? null : { title: 'Winners', value: winners.map((name, index) => `${index + 1}. ${name}`).join('\n') },
});
