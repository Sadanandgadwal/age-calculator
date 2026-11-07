import { monthlyPayment } from '../emi/logic.js';
import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

const MAX_MONTHS = 600;

export function simulate(balance, annualRate, payment, lastMonth = Infinity) {
  const monthlyRate = annualRate / 12 / 100;
  const years = [];
  let remaining = balance;
  let month = 0;
  let totalInterest = 0;
  while (remaining > 0) {
    const interest = Math.round(remaining * monthlyRate);
    const principal = month + 1 >= lastMonth ? remaining : Math.min(remaining, payment - interest);
    if (principal <= 0) return null;
    remaining -= principal;
    totalInterest += interest;
    if (month % 12 === 0) years.push({ year: years.length + 1, principal: 0, interest: 0, balance: remaining });
    const current = years.at(-1);
    current.principal += principal;
    current.interest += interest;
    current.balance = remaining;
    month += 1;
  }
  return { months: month, totalInterest, years };
}

export function formatMonths(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (rest || !years) parts.push(`${rest} ${rest === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
}

export function evaluate({ balance, rate, tenure, extra }) {
  const { errors, values, isValid } = collectFields({
    balance: checkNumber(balance, { required: 'Please enter the loan balance.', aboveMin: true, max: 1e13, minMessage: 'The balance must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    rate: checkNumber(rate, { required: 'Please enter the interest rate.', max: 50, minMessage: 'The interest rate must be between 0 and 50%.', maxMessage: 'The interest rate must be between 0 and 50%.' }),
    tenure: checkNumber(tenure, { required: 'Please enter the remaining tenure.', aboveMin: true, max: 50, minMessage: 'The tenure must be greater than 0.', maxMessage: 'The tenure can be up to 50 years.' }),
    extra: checkNumber(extra, { required: 'Please enter the extra monthly payment.', max: 1e13, minMessage: "The extra payment can't be negative.", maxMessage: 'This amount is too large to calculate.' }),
  });
  if (!isValid) return { errors };
  const months = Math.round(values.tenure * 12);
  if (months < 1 || months > MAX_MONTHS || Math.abs(values.tenure * 12 - months) > 1e-6) {
    return { errors: { tenure: 'The tenure must be a whole number of months, such as 7.5 years.' } };
  }
  const principal = toPaise(values.balance);
  const emi = monthlyPayment(principal, values.rate, months);
  const extraPaise = toPaise(values.extra);
  const before = simulate(principal, values.rate, emi, months);
  const after = simulate(principal, values.rate, emi + extraPaise, months);
  return {
    errors,
    result: {
      principal,
      rate: values.rate,
      emi,
      extra: extraPaise,
      payment: emi + extraPaise,
      before,
      after,
      monthsSaved: before.months - after.months,
      interestSaved: before.totalInterest - after.totalInterest,
    },
  };
}

export const SCHEDULE_COLUMNS = ['Year', 'Principal', 'Interest', 'Balance'];

export const scheduleRows = (years) => years.map(({ year, principal, interest, balance }) => [year, formatInr(principal), formatInr(interest), formatInr(balance)]);

export function getRows(result) {
  return [
    { label: 'Interest saved', value: formatInr(result.interestSaved) },
    { label: 'Time saved', value: formatMonths(result.monthsSaved) },
    { label: 'New payoff time', value: formatMonths(result.after.months) },
    { label: 'Current EMI', value: formatInr(result.emi) },
    { label: 'New monthly payment', value: formatInr(result.payment) },
    { label: 'Interest without extra payments', value: formatInr(result.before.totalInterest) },
    { label: 'Interest with extra payments', value: formatInr(result.after.totalInterest) },
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Loan balance', value: formatInr(result.principal) },
      { label: 'Interest rate', value: `${result.rate}% a year` },
      { label: 'Remaining tenure', value: formatMonths(result.before.months) },
      { label: 'Extra each month', value: formatInr(result.extra) },
    ],
    results: rows.slice(0, 3),
    details: [rows[3]],
    table: { caption: 'Yearly schedule with extra payments', columns: SCHEDULE_COLUMNS, rows: scheduleRows(result.after.years) },
    formula: 'Each month, interest = balance × yearly rate ÷ 12, and the rest of the payment reduces the balance.',
  };
}
