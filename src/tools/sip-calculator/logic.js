import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

const TOO_LARGE = 1e17;

export function growSip(monthly, annualReturn, years, stepUp = 0) {
  const rate = annualReturn / 12 / 100;
  const rows = [];
  let value = 0;
  let invested = 0;
  let amount = monthly;
  for (let year = 1; year <= years; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      value = (value + amount) * (1 + rate);
      invested += amount;
    }
    rows.push({ year, monthly: amount, invested, value });
    amount = Math.round(amount * (1 + stepUp / 100));
  }
  return { value, invested, gains: value - invested, years: rows };
}

export function evaluate({ monthly, rate, years, stepUp }) {
  const { errors, values, isValid } = collectFields({
    monthly: checkNumber(monthly, { required: 'Please enter the monthly investment.', aboveMin: true, max: 1e9, minMessage: 'The monthly investment must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    rate: checkNumber(rate, { required: 'Please enter the expected return.', max: 50, minMessage: 'The return must be between 0 and 50%.', maxMessage: 'The return must be between 0 and 50%.' }),
    years: checkNumber(years, { required: 'Please enter the number of years.', min: 1, max: 50, whole: true, minMessage: 'Please enter 1 to 50 years.', maxMessage: 'Please enter 1 to 50 years.' }),
    stepUp: String(stepUp ?? '').trim() ? checkNumber(stepUp, { max: 50, minMessage: 'The yearly increase must be between 0 and 50%.', maxMessage: 'The yearly increase must be between 0 and 50%.' }) : { value: 0 },
  });
  if (!isValid) return { errors };
  const grown = growSip(toPaise(values.monthly), values.rate, values.years, values.stepUp);
  if (grown.value > TOO_LARGE) return { errors: { years: 'The result is too large to show. Try a smaller amount, return or time.' } };
  return { errors, result: { monthly: toPaise(values.monthly), rate: values.rate, yearsCount: values.years, stepUp: values.stepUp, ...grown } };
}

const rupees = (paise) => formatInr(Math.round(paise));

export const SCHEDULE_COLUMNS = ['Year', 'Monthly SIP', 'Invested', 'Value'];
export const scheduleRows = (years) => years.map(({ year, monthly, invested, value }) => [year, rupees(monthly), rupees(invested), rupees(value)]);

export function getRows(result) {
  return [
    { label: 'Expected value', value: rupees(result.value) },
    { label: 'Total invested', value: rupees(result.invested) },
    { label: 'Estimated gains', value: rupees(result.gains) },
    { label: 'Time', value: `${result.yearsCount} ${result.yearsCount === 1 ? 'year' : 'years'}` },
    ...(result.stepUp > 0 ? [{ label: 'Monthly SIP in the last year', value: rupees(result.years.at(-1).monthly) }] : []),
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Monthly investment', value: rupees(result.monthly) },
      { label: 'Expected return', value: `${formatDecimal(result.rate)}% a year` },
      { label: 'Time', value: rows[3].value },
      { label: 'Yearly increase', value: `${formatDecimal(result.stepUp)}%` },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(4),
    notes: ['Mutual fund returns are not guaranteed. This is an estimate, not financial advice.'],
    table: { caption: 'Yearly growth', columns: SCHEDULE_COLUMNS, rows: scheduleRows(result.years) },
    formula: 'Value = P × ((1 + r)ⁿ − 1) ÷ r × (1 + r), with each payment made at the start of the month.',
  };
}
