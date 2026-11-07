import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

export const MODES = [
  { id: 'future', name: 'Future cost', title: 'What something will cost in the future', labelA: 'Cost today (₹)', labelYears: 'Years from now' },
  { id: 'past', name: 'Value of past money', title: 'What past money is worth today', labelA: 'Amount in the past (₹)', labelYears: 'Years ago' },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function evaluate(modeId, { amount, rate, years }) {
  const mode = getMode(modeId);
  const { errors, values, isValid } = collectFields({
    amount: checkNumber(amount, { required: 'Please enter the amount.', aboveMin: true, max: 1e12, minMessage: 'The amount must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    rate: checkNumber(rate, { required: 'Please enter the inflation rate.', max: 50, minMessage: 'The inflation rate must be between 0 and 50%.', maxMessage: 'The inflation rate must be between 0 and 50%.' }),
    years: checkNumber(years, { required: `Please enter the ${mode.labelYears.toLowerCase()}.`, aboveMin: true, max: 100, minMessage: 'The time must be greater than 0.', maxMessage: 'The time can be up to 100 years.' }),
  });
  if (!isValid) return { errors };
  const factor = (1 + values.rate / 100) ** values.years;
  const start = toPaise(values.amount);
  const end = Math.round(start * factor);
  if (end > 1e17) return { errors: { years: 'The result is too large to show. Try a lower rate or fewer years.' } };
  return {
    errors,
    result: {
      modeId,
      start,
      end,
      rate: values.rate,
      years: values.years,
      increase: roundTo2((factor - 1) * 100),
      purchasingPower: Math.round(start / factor),
      lostShare: roundTo2((1 - 1 / factor) * 100),
    },
  };
}

const yearsText = (years) => `${formatDecimal(years)} ${years === 1 ? 'year' : 'years'}`;

export function getRows(result) {
  if (result.modeId === 'future') {
    return [
      { label: `Cost in ${yearsText(result.years)}`, value: formatInr(result.end) },
      { label: 'Price rise', value: `${formatDecimal(result.increase)}%` },
      { label: 'Buying power lost', value: `${formatDecimal(result.lostShare)}%` },
      { label: 'Cost today', value: formatInr(result.start) },
      { label: `Buying power of ${formatInr(result.start)} in ${yearsText(result.years)}, in today’s money`, value: formatInr(result.purchasingPower) },
    ];
  }
  return [
    { label: 'Worth today', value: formatInr(result.end) },
    { label: 'Price rise', value: `${formatDecimal(result.increase)}%` },
    { label: 'Buying power lost', value: `${formatDecimal(result.lostShare)}%` },
    { label: `Amount ${yearsText(result.years)} ago`, value: formatInr(result.start) },
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, result) {
  const rows = getRows(result);
  return {
    subtitle: mode.title,
    inputs: [
      { label: mode.labelA, value: formatInr(result.start) },
      { label: 'Inflation', value: `${formatDecimal(result.rate)}% a year` },
      { label: mode.labelYears, value: formatDecimal(result.years) },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(4),
    notes: ['Uses the same inflation rate every year. Real prices rise at different rates for different things.'],
    formula: 'Future cost = cost today × (1 + inflation)^years',
  };
}
