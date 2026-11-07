import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

const TOO_LARGE = 1e17;

export const FREQUENCIES = [
  { id: '1', name: 'Yearly', perYear: 1 },
  { id: '2', name: 'Half-yearly', perYear: 2 },
  { id: '4', name: 'Quarterly', perYear: 4 },
  { id: '12', name: 'Monthly', perYear: 12 },
  { id: '365', name: 'Daily', perYear: 365 },
];

export const getFrequency = (id) => FREQUENCIES.find((item) => item.id === id) ?? FREQUENCIES[2];

export function grow({ principal, rate, months, perYear, deposit }) {
  const monthlyRate = (1 + rate / 100 / perYear) ** (perYear / 12) - 1;
  const years = [];
  let balance = principal;
  let invested = principal;
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * monthlyRate;
    balance += interest + deposit;
    invested += deposit;
    if ((month - 1) % 12 === 0) years.push({ year: years.length + 1, deposits: 0, interest: 0, balance: 0 });
    const current = years.at(-1);
    current.deposits += deposit;
    current.interest += interest;
    current.balance = balance;
  }
  return { balance, invested, interest: balance - invested, years };
}

export function evaluate({ principal, rate, years, frequency, deposit }) {
  const { errors, values, isValid } = collectFields({
    principal: checkNumber(principal, { required: 'Please enter the starting amount.', max: 1e12, minMessage: "The starting amount can't be negative.", maxMessage: 'This amount is too large to calculate.' }),
    rate: checkNumber(rate, { required: 'Please enter the interest rate.', max: 50, minMessage: 'The interest rate must be between 0 and 50%.', maxMessage: 'The interest rate must be between 0 and 50%.' }),
    years: checkNumber(years, { required: 'Please enter the number of years.', aboveMin: true, max: 100, minMessage: 'The time must be greater than 0.', maxMessage: 'The time can be up to 100 years.' }),
    deposit: String(deposit ?? '').trim() ? checkNumber(deposit, { max: 1e10, minMessage: "The monthly deposit can't be negative.", maxMessage: 'This amount is too large to calculate.' }) : { value: 0 },
  });
  if (!isValid) return { errors };
  const months = Math.round(values.years * 12);
  if (Math.abs(values.years * 12 - months) > 1e-6) return { errors: { years: 'The time must be a whole number of months, such as 2.5 years.' } };
  if (values.principal === 0 && values.deposit === 0) return { errors: { principal: 'Please enter a starting amount, a monthly deposit, or both.' } };
  const freq = getFrequency(frequency);
  const principalPaise = toPaise(values.principal);
  const depositPaise = toPaise(values.deposit);
  const grown = grow({ principal: principalPaise, rate: values.rate, months, perYear: freq.perYear, deposit: depositPaise });
  const effective = ((1 + values.rate / 100 / freq.perYear) ** freq.perYear - 1) * 100;
  if (grown.balance > TOO_LARGE) return { errors: { years: 'The result is too large to show. Try a smaller amount, rate or time.' } };
  return { errors, result: { principal: principalPaise, rate: values.rate, months, frequency: freq, deposit: depositPaise, effective, ...grown } };
}

const rupees = (paise) => formatInr(Math.round(paise));

export const SCHEDULE_COLUMNS = ['Year', 'Deposits', 'Interest', 'Balance'];

export const scheduleRows = (years) => years.map(({ year, deposits, interest, balance }) => [year, rupees(deposits), rupees(interest), rupees(balance)]);

export const formatYears = (months) => (months % 12 ? `${(months / 12).toLocaleString('en-IN', { maximumFractionDigits: 2 })} years (${months} months)` : `${months / 12} ${months === 12 ? 'year' : 'years'}`);

export function getRows(result) {
  return [
    { label: 'Final amount', value: rupees(result.balance) },
    { label: 'Interest earned', value: rupees(result.interest) },
    { label: 'Total invested', value: rupees(result.invested) },
    { label: 'Compounding', value: result.frequency.name },
    { label: 'Effective yearly rate', value: `${result.effective.toFixed(2)}%` },
    { label: 'Time', value: formatYears(result.months) },
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Starting amount', value: rupees(result.principal) },
      { label: 'Interest rate', value: `${result.rate}% a year` },
      { label: 'Time', value: formatYears(result.months) },
      { label: 'Compounding', value: result.frequency.name },
      { label: 'Monthly deposit', value: rupees(result.deposit) },
    ],
    results: rows.slice(0, 3),
    details: [rows[4]],
    table: { caption: 'Yearly growth', columns: SCHEDULE_COLUMNS, rows: scheduleRows(result.years) },
    formula: 'A = P × (1 + r ÷ n)^(n × t), plus each monthly deposit growing at the same rate.',
  };
}
