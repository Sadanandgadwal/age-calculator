import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

const MAX_AMOUNT = 1e13;
const MAX_MONTHS = 1200;

export function monthlyPayment(principalPaise, annualRate, months) {
  const rate = annualRate / 12 / 100;
  if (rate === 0) return Math.round(principalPaise / months);
  const growth = (1 + rate) ** months;
  return Math.round((principalPaise * rate * growth) / (growth - 1));
}

export function calculateEmi({ amount, rate, months }) {
  const principal = toPaise(amount);
  const emi = monthlyPayment(principal, rate, months);
  const monthlyRate = rate / 12 / 100;
  const years = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPayment = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = Math.round(balance * monthlyRate);
    const isLast = month === months;
    const principalPart = isLast ? balance : Math.min(balance, emi - interest);
    balance -= principalPart;
    totalInterest += interest;
    totalPayment += principalPart + interest;

    if ((month - 1) % 12 === 0) years.push({ year: years.length + 1, principal: 0, interest: 0, balance });
    const current = years.at(-1);
    current.principal += principalPart;
    current.interest += interest;
    current.balance = balance;
  }

  return { principal, rate, months, emi, totalInterest, totalPayment, years };
}

export function evaluate({ amount, rate, tenure, unit }) {
  const isYears = unit === 'years';
  const { errors, values, isValid } = collectFields({
    amount: checkNumber(amount, {
      required: 'Please enter the loan amount.',
      aboveMin: true,
      max: MAX_AMOUNT,
      minMessage: 'The loan amount must be greater than 0.',
      maxMessage: 'This amount is too large to calculate.',
    }),
    rate: checkNumber(rate, { required: 'Please enter the interest rate.', max: 100, maxMessage: 'The interest rate must be between 0 and 100.', minMessage: 'The interest rate must be between 0 and 100.' }),
    tenure: checkNumber(tenure, { required: 'Please enter the loan tenure.', aboveMin: true, minMessage: 'The tenure must be greater than 0.' }),
  });

  if (isValid) {
    const months = isYears ? Number((values.tenure * 12).toFixed(6)) : values.tenure;
    if (!Number.isInteger(months)) {
      errors.tenure = isYears ? 'The tenure must be a whole number of months, such as 1.5 years.' : 'Please enter a whole number of months.';
    } else if (months > MAX_MONTHS) {
      errors.tenure = 'The tenure can be up to 100 years.';
    } else {
      return { errors, result: calculateEmi({ amount: values.amount, rate: values.rate, months }) };
    }
  }

  return { errors };
}

export const buildResultText = ({ principal, rate, months, emi, totalInterest, totalPayment }) =>
  [
    `Loan amount: ${formatInr(principal)}`,
    `Interest rate: ${rate}% a year`,
    `Tenure: ${months} months`,
    `Monthly EMI: ${formatInr(emi)}`,
    `Total interest: ${formatInr(totalInterest)}`,
    `Total payment: ${formatInr(totalPayment)}`,
  ].join('\n');

export const buildReport = ({ principal, rate, months, emi, totalInterest, totalPayment, years }) => ({
  inputs: [
    { label: 'Loan amount', value: formatInr(principal) },
    { label: 'Interest rate', value: `${rate}% a year` },
    { label: 'Tenure', value: `${months} months` },
  ],
  results: [
    { label: 'Monthly EMI', value: formatInr(emi) },
    { label: 'Total interest', value: formatInr(totalInterest) },
    { label: 'Total payment', value: formatInr(totalPayment) },
  ],
  table: {
    caption: 'Yearly schedule',
    columns: ['Year', 'Principal', 'Interest', 'Balance'],
    rows: years.map(({ year, principal: paid, interest, balance }) => [year, formatInr(paid), formatInr(interest), formatInr(balance)]),
  },
  formula: 'EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where r is the monthly rate and n the number of months.',
});
