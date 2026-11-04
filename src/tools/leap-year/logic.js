import { isLeapYear } from '../../utils/date.js';
import { checkNumber } from '../../utils/fieldValidation.js';

const MESSAGE = 'Please enter a year from 1 to 9999.';

export function nextLeapYear(year) {
  let candidate = year + 1;
  while (!isLeapYear(candidate)) candidate += 1;
  return candidate;
}

export function previousLeapYear(year) {
  for (let candidate = year - 1; candidate >= 4; candidate -= 1) {
    if (isLeapYear(candidate)) return candidate;
  }
  return null;
}

export function explainYear(year) {
  if (year % 400 === 0) return `${year} is a leap year because it is a century year that divides evenly by 400.`;
  if (year % 100 === 0) return `${year} is not a leap year because it is a century year that does not divide evenly by 400.`;
  if (year % 4 === 0) return `${year} is a leap year because it divides evenly by 4 and is not a century year.`;
  return `${year} is not a leap year because it does not divide evenly by 4.`;
}

export function checkYear(year) {
  const isLeap = isLeapYear(year);
  return {
    year,
    isLeap,
    divisibleBy4: year % 4 === 0,
    divisibleBy100: year % 100 === 0,
    divisibleBy400: year % 400 === 0,
    next: nextLeapYear(year),
    previous: previousLeapYear(year),
    daysInYear: isLeap ? 366 : 365,
    daysInFebruary: isLeap ? 29 : 28,
    explanation: explainYear(year),
  };
}

export function evaluate(text) {
  const { value, error } = checkNumber(text, { required: 'Please enter a year.', min: 1, max: 9999, whole: true, minMessage: MESSAGE, maxMessage: MESSAGE });
  return error ? { errors: { year: error } } : { errors: {}, result: checkYear(value) };
}

export const buildResultText = (result) =>
  [result.explanation, `Next leap year: ${result.next}`, `Days in ${result.year}: ${result.daysInYear}`].join('\n');

const yesNo = (value) => (value ? 'Yes' : 'No');

export const buildReport = (result) => ({
  inputs: [{ label: 'Year', value: result.year }],
  results: [
    { label: 'Leap year', value: yesNo(result.isLeap) },
    { label: 'Next leap year', value: result.next },
    { label: 'Previous leap year', value: result.previous ?? 'None' },
  ],
  details: [
    { label: 'Divides by 4', value: yesNo(result.divisibleBy4) },
    { label: 'Divides by 100', value: yesNo(result.divisibleBy100) },
    { label: 'Divides by 400', value: yesNo(result.divisibleBy400) },
    { label: 'Days in the year', value: result.daysInYear },
    { label: 'Days in February', value: result.daysInFebruary },
  ],
  formula: 'A year is a leap year if it divides by 4, except years that divide by 100 but not by 400.',
  notes: [result.explanation],
});
