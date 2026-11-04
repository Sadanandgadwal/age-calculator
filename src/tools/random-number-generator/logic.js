import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { randomBelow } from '../../utils/secureRandom.js';

export const MAX_COUNT = 1000;
const LIMIT = Number.MAX_SAFE_INTEGER;

const boundField = (text, required) =>
  checkNumber(text, { required, min: -LIMIT, max: LIMIT, whole: true, minMessage: 'This number is too small.', maxMessage: 'This number is too large.' });

export function validate({ min, max, count, unique }) {
  const { errors, values, isValid } = collectFields({
    min: boundField(min, 'Please enter the lowest number.'),
    max: boundField(max, 'Please enter the highest number.'),
    count: checkNumber(count, { required: 'Please enter how many numbers you need.', min: 1, max: MAX_COUNT, whole: true, minMessage: 'Please enter at least 1.', maxMessage: `Please enter ${formatNumber(MAX_COUNT)} or fewer.` }),
  });
  if (!isValid) return { errors };
  if (values.max < values.min) return { errors: { max: 'The highest number must not be below the lowest.' } };

  const size = values.max - values.min + 1;
  if (!Number.isSafeInteger(size)) return { errors: { max: 'This range is too large. Please choose a smaller one.' } };
  if (unique && values.count > size) return { errors: { count: `This range only has ${formatNumber(size)} different numbers.` } };
  return { errors: {}, values: { ...values, size } };
}

function pickUnique(size, count) {
  const swapped = new Map();
  return Array.from({ length: count }, (_, index) => {
    const remaining = size - index;
    const choice = randomBelow(remaining);
    const value = swapped.get(choice) ?? choice;
    swapped.set(choice, swapped.get(remaining - 1) ?? remaining - 1);
    return value;
  });
}

export function generateNumbers({ min, size, count, unique, sorted }) {
  const offsets = unique ? pickUnique(size, count) : Array.from({ length: count }, () => randomBelow(size));
  const numbers = offsets.map((offset) => min + offset);
  return sorted ? numbers.sort((a, b) => a - b) : numbers;
}

export const describeNumbers = (numbers) => numbers.map(String).join(', ');

export const buildResultText = ({ numbers }) => describeNumbers(numbers);

const yesNo = (value) => (value ? 'Yes' : 'No');

export const buildReport = ({ numbers, min, max, unique, sorted }) => ({
  inputs: [
    { label: 'Lowest number', value: String(min) },
    { label: 'Highest number', value: String(max) },
    { label: 'How many', value: formatNumber(numbers.length) },
    { label: 'No repeats', value: yesNo(unique) },
    { label: 'Sorted', value: yesNo(sorted) },
  ],
  results: numbers.length === 1 ? [{ label: 'Random number', value: String(numbers[0]) }] : [{ label: 'Numbers picked', value: formatNumber(numbers.length) }],
  text: numbers.length === 1 ? null : { title: 'Random numbers', value: describeNumbers(numbers) },
});
