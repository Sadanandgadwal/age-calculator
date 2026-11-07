import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

const money = (text, name) =>
  checkNumber(text, { required: `Please enter the ${name}.`, aboveMin: true, max: 1e13, minMessage: `The ${name} must be greater than 0.`, maxMessage: 'This amount is too large to calculate.' });

export function evaluate({ invested, current, years }) {
  const { errors, values, isValid } = collectFields({
    invested: money(invested, 'amount invested'),
    current: money(current, 'current value'),
    years: checkNumber(years, { required: 'Please enter how long you held it.', aboveMin: true, max: 100, minMessage: 'The time must be greater than 0.', maxMessage: 'The time can be up to 100 years.' }),
  });
  if (!isValid) return { errors };
  const start = toPaise(values.invested);
  const end = toPaise(values.current);
  const ratio = end / start;
  const cagr = (ratio ** (1 / values.years) - 1) * 100;
  return {
    errors,
    result: {
      start,
      end,
      years: values.years,
      gain: end - start,
      absolute: roundTo2((ratio - 1) * 100),
      cagr: roundTo2(cagr),
      multiple: roundTo2(ratio),
      doubling: cagr > 0 ? roundTo2(Math.log(2) / Math.log(1 + cagr / 100)) : null,
    },
  };
}

export const formatPercent = (value) => `${formatDecimal(value)}%`;

export function getRows(result) {
  return [
    { label: 'Yearly return (CAGR)', value: formatPercent(result.cagr) },
    { label: 'Total return', value: formatPercent(result.absolute) },
    { label: result.gain < 0 ? 'Loss' : 'Gain', value: formatInr(Math.abs(result.gain)) },
    { label: 'Growth', value: `${formatDecimal(result.multiple)}×` },
    { label: 'Time held', value: `${formatDecimal(result.years)} ${result.years === 1 ? 'year' : 'years'}` },
    ...(result.doubling !== null ? [{ label: 'Doubles every', value: `${formatDecimal(result.doubling)} years at this rate` }] : []),
  ];
}

export const SHORT_NOTE = 'For less than a year, the yearly return assumes the same growth carries on for a full year, so treat it with care.';
export const describeShort = (result) => (result.years < 1 ? SHORT_NOTE : null);

export const buildResultText = (result) => [...getRows(result).map(({ label, value }) => `${label}: ${value}`), describeShort(result)].filter(Boolean).join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Amount invested', value: formatInr(result.start) },
      { label: 'Current value', value: formatInr(result.end) },
      { label: 'Time held', value: rows[4].value },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(3).filter(({ label }) => label !== 'Time held'),
    notes: [describeShort(result)].filter(Boolean),
    formula: 'CAGR = (current value ÷ amount invested)^(1 ÷ years) − 1. Total return = (current value − amount invested) ÷ amount invested.',
  };
}
