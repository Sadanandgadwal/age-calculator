import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

const MAX_MONTHS = 1200;

const money = (text, name, optional = false) =>
  optional && !String(text ?? '').trim()
    ? { value: 0 }
    : checkNumber(text, { required: `Please enter the ${name}.`, max: 1e12, minMessage: `The ${name} can't be negative.`, maxMessage: 'This amount is too large to calculate.' });
const rateField = (text) => checkNumber(text, { required: 'Please enter the expected return.', max: 30, minMessage: 'The return must be between 0 and 30%.', maxMessage: 'The return must be between 0 and 30%.' });

export const MODES = [
  { id: 'monthly', name: 'Monthly saving needed', title: 'How much to save each month' },
  { id: 'time', name: 'Time to reach a goal', title: 'How long it will take' },
];

export function simulate(start, annualRate, monthly, months) {
  const rate = annualRate / 12 / 100;
  const years = [];
  let balance = start;
  let deposits = start;
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * rate;
    balance += interest + monthly;
    deposits += monthly;
    if ((month - 1) % 12 === 0) years.push({ year: years.length + 1, deposits: 0, interest: 0, balance: 0 });
    const current = years.at(-1);
    current.deposits += monthly;
    current.interest += interest;
    current.balance = balance;
  }
  return { balance, deposits, interest: balance - deposits, years };
}

export function monthlyNeeded(goal, start, annualRate, months) {
  const rate = annualRate / 12 / 100;
  const growth = (1 + rate) ** months;
  const gap = goal - start * growth;
  if (gap <= 0) return 0;
  return Math.ceil(rate === 0 ? gap / months : (gap * rate) / (growth - 1));
}

export function monthsNeeded(goal, start, annualRate, monthly) {
  const rate = annualRate / 12 / 100;
  let balance = start;
  for (let month = 0; month <= MAX_MONTHS; month += 1) {
    if (balance >= goal) return month;
    balance += balance * rate + monthly;
  }
  return null;
}

export function evaluate(modeId, values) {
  const fields =
    modeId === 'monthly'
      ? { goal: money(values.goal, 'goal amount'), current: money(values.current, 'current savings', true), rate: rateField(values.rate), years: checkNumber(values.years, { required: 'Please enter the number of years.', aboveMin: true, max: 100, minMessage: 'The time must be greater than 0.', maxMessage: 'The time can be up to 100 years.' }) }
      : { goal: money(values.goal, 'goal amount'), current: money(values.current, 'current savings', true), rate: rateField(values.rate), monthly: money(values.monthly, 'monthly saving') };
  const { errors, values: v, isValid } = collectFields(fields);
  if (!isValid) return { errors };
  if (v.goal <= 0) return { errors: { goal: 'The goal must be greater than 0.' } };
  const goal = toPaise(v.goal);
  const current = toPaise(v.current);

  if (modeId === 'monthly') {
    const months = Math.round(v.years * 12);
    if (Math.abs(v.years * 12 - months) > 1e-6) return { errors: { years: 'The time must be a whole number of months, such as 2.5 years.' } };
    const monthly = monthlyNeeded(goal, current, v.rate, months);
    return { errors, result: { modeId, goal, current, rate: v.rate, monthly, months, ...simulate(current, v.rate, monthly, months) } };
  }

  const monthly = toPaise(v.monthly);
  const months = monthsNeeded(goal, current, v.rate, monthly);
  if (months === null) return { errors: { monthly: 'At this rate the goal takes more than 100 years. Try saving more each month.' } };
  return { errors, result: { modeId, goal, current, rate: v.rate, monthly, months, ...simulate(current, v.rate, monthly, months) } };
}

export function formatMonths(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (rest || !years) parts.push(`${rest} ${rest === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
}

const rupees = (paise) => formatInr(Math.round(paise));

export const SCHEDULE_COLUMNS = ['Year', 'Saved', 'Interest', 'Balance'];
export const scheduleRows = (years) => years.map(({ year, deposits, interest, balance }) => [year, rupees(deposits), rupees(interest), rupees(balance)]);

export function getRows(result) {
  const main = result.modeId === 'monthly' ? { label: 'Save each month', value: rupees(result.monthly) } : { label: 'Time to reach the goal', value: formatMonths(result.months) };
  return [
    main,
    { label: 'Final balance', value: rupees(result.balance) },
    { label: 'Interest earned', value: rupees(result.interest) },
    { label: 'Total you put in', value: rupees(result.deposits) },
    result.modeId === 'monthly' ? { label: 'Time', value: formatMonths(result.months) } : { label: 'Monthly saving', value: rupees(result.monthly) },
  ];
}

export const describeReached = (result) => (result.months === 0 || (result.modeId === 'monthly' && result.monthly === 0) ? 'Your current savings already reach the goal in this time, without saving more.' : null);

export const buildResultText = (result) => [...getRows(result).map(({ label, value }) => `${label}: ${value}`), describeReached(result)].filter(Boolean).join('\n');

export function buildReport(mode, result) {
  const rows = getRows(result);
  return {
    subtitle: mode.title,
    inputs: [
      { label: 'Goal', value: rupees(result.goal) },
      { label: 'Current savings', value: rupees(result.current) },
      { label: 'Expected return', value: `${result.rate}% a year` },
      result.modeId === 'monthly' ? { label: 'Time', value: formatMonths(result.months) } : { label: 'Monthly saving', value: rupees(result.monthly) },
    ],
    results: rows.slice(0, 2),
    details: rows.slice(2, 4),
    notes: [describeReached(result)].filter(Boolean),
    table: result.years.length ? { caption: 'Yearly progress', columns: SCHEDULE_COLUMNS, rows: scheduleRows(result.years) } : null,
    formula: 'Monthly saving = (goal − current × (1 + r)ⁿ) × r ÷ ((1 + r)ⁿ − 1), where r is the monthly return and n the months.',
  };
}
