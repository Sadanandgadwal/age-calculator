import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

const WEEKS_PER_YEAR = 52;

export const PERIODS = [
  { id: 'hour', name: 'Hourly', noun: 'hour' },
  { id: 'day', name: 'Daily', noun: 'day' },
  { id: 'week', name: 'Weekly', noun: 'week' },
  { id: 'month', name: 'Monthly', noun: 'month' },
  { id: 'year', name: 'Yearly', noun: 'year' },
];

export const getPeriod = (id) => PERIODS.find((item) => item.id === id) ?? PERIODS[3];

export function perYear(hoursPerWeek, daysPerWeek) {
  return { hour: hoursPerWeek * WEEKS_PER_YEAR, day: daysPerWeek * WEEKS_PER_YEAR, week: WEEKS_PER_YEAR, month: 12, year: 1 };
}

export function evaluate({ amount, period, hours, days, raise }) {
  const { errors, values, isValid } = collectFields({
    amount: checkNumber(amount, { required: 'Please enter your pay.', aboveMin: true, max: 1e12, minMessage: 'The pay must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    hours: checkNumber(hours, { required: 'Please enter the hours you work each week.', aboveMin: true, max: 168, minMessage: 'Hours must be more than 0.', maxMessage: 'A week has 168 hours.' }),
    days: checkNumber(days, { required: 'Please enter the days you work each week.', aboveMin: true, max: 7, minMessage: 'Days must be more than 0.', maxMessage: 'A week has 7 days.' }),
    raise: String(raise ?? '').trim() ? checkNumber(raise, { min: -99.99, max: 1000, minMessage: 'A pay cut must be less than 100%.', maxMessage: 'Please enter 1,000% or less.' }) : { value: null },
  });
  if (!isValid) return { errors };
  if (values.hours < values.days) return { errors: { hours: 'Hours a week must be at least the number of days, as each day needs some hours.' } };
  const counts = perYear(values.hours, values.days);
  const chosen = getPeriod(period);
  const yearly = toPaise(values.amount) * counts[chosen.id];
  const pay = Object.fromEntries(PERIODS.map(({ id }) => [id, yearly / counts[id]]));
  const raised = values.raise === null ? null : Object.fromEntries(PERIODS.map(({ id }) => [id, (yearly * (1 + values.raise / 100)) / counts[id]]));
  return { errors, result: { period: chosen, amount: toPaise(values.amount), hours: values.hours, days: values.days, raise: values.raise, pay, raised } };
}

const rupees = (paise) => formatInr(Math.round(paise));

export function tableRows({ pay, raised }) {
  return PERIODS.slice()
    .reverse()
    .map(({ id, name }) => [name, rupees(pay[id]), ...(raised ? [rupees(raised[id])] : [])]);
}

export const tableColumns = (result) => ['Period', 'Pay', ...(result.raised ? [`After ${formatDecimal(Math.abs(result.raise))}% ${result.raise < 0 ? 'cut' : 'raise'}`] : [])];

export function getRows(result) {
  return [
    { label: 'Yearly', value: rupees(result.pay.year) },
    { label: 'Monthly', value: rupees(result.pay.month) },
    { label: 'Hourly', value: rupees(result.pay.hour) },
  ];
}

export function buildResultText(result) {
  const columns = tableColumns(result);
  return tableRows(result)
    .map(([name, ...cells]) => `${name}: ${cells.map((cell, index) => (index === 0 ? cell : `${cell} (${columns[index + 1].toLowerCase()})`)).join(', ')}`)
    .join('\n');
}

export function buildReport(result) {
  return {
    inputs: [
      { label: 'Pay', value: `${rupees(result.amount)} per ${result.period.noun}` },
      { label: 'Hours a week', value: formatDecimal(result.hours) },
      { label: 'Days a week', value: formatDecimal(result.days) },
      ...(result.raise !== null ? [{ label: 'Pay change', value: `${formatDecimal(result.raise)}%` }] : []),
    ],
    results: getRows(result),
    table: { caption: 'Pay for each period', columns: tableColumns(result), rows: tableRows(result) },
    notes: ['Based on 52 working weeks a year and pay before tax and deductions. Paid leave and overtime are not counted separately.'],
    formula: 'Yearly pay = pay × periods in a year. Hourly pay = yearly pay ÷ (hours a week × 52).',
  };
}
