import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

const age = (text, name) => checkNumber(text, { required: `Please enter ${name}.`, min: 1, max: 120, whole: true, minMessage: 'Please enter an age from 1 to 120.', maxMessage: 'Please enter an age from 1 to 120.' });
const percent = (text, name, max = 30) => checkNumber(text, { required: `Please enter ${name}.`, max, minMessage: `Please enter a rate from 0 to ${max}%.`, maxMessage: `Please enter a rate from 0 to ${max}%.` });

export function corpusNeeded(monthlyExpense, months, postReturn, inflation) {
  const rate = postReturn / 12 / 100;
  const growth = (1 + inflation / 100) ** (1 / 12) - 1;
  const ratio = (1 + growth) / (1 + rate);
  if (Math.abs(ratio - 1) < 1e-12) return monthlyExpense * months;
  return (monthlyExpense * (1 - ratio ** months)) / (1 - ratio);
}

export function evaluate(values) {
  const { errors, values: v, isValid } = collectFields({
    age: age(values.age, 'your current age'),
    retireAge: age(values.retireAge, 'your retirement age'),
    lifeAge: age(values.lifeAge, 'the age to plan up to'),
    expenses: checkNumber(values.expenses, { required: 'Please enter your monthly expenses.', aboveMin: true, max: 1e9, minMessage: 'Expenses must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    inflation: percent(values.inflation, 'the inflation rate', 20),
    preReturn: percent(values.preReturn, 'the return before retirement'),
    postReturn: percent(values.postReturn, 'the return after retirement'),
    savings: String(values.savings ?? '').trim() ? checkNumber(values.savings, { max: 1e12, minMessage: "Savings can't be negative.", maxMessage: 'This amount is too large to calculate.' }) : { value: 0 },
  });
  if (!isValid) return { errors };
  if (v.retireAge <= v.age) return { errors: { retireAge: 'Your retirement age must be more than your current age.' } };
  if (v.lifeAge <= v.retireAge) return { errors: { lifeAge: 'This age must be more than your retirement age.' } };

  const yearsToRetire = v.retireAge - v.age;
  const monthsToRetire = yearsToRetire * 12;
  const retirementMonths = (v.lifeAge - v.retireAge) * 12;
  const expenses = toPaise(v.expenses);
  const savings = toPaise(v.savings);
  const expenseAtRetirement = expenses * (1 + v.inflation / 100) ** yearsToRetire;
  const corpus = corpusNeeded(expenseAtRetirement, retirementMonths, v.postReturn, v.inflation);
  const monthlyRate = v.preReturn / 12 / 100;
  const savingsGrown = savings * (1 + monthlyRate) ** monthsToRetire;
  const shortfall = Math.max(0, corpus - savingsGrown);
  const growth = (1 + monthlyRate) ** monthsToRetire;
  const monthly = shortfall === 0 ? 0 : monthlyRate === 0 ? shortfall / monthsToRetire : (shortfall * monthlyRate) / (growth - 1);
  if (corpus > 1e17) return { errors: { expenses: 'The result is too large to show. Check your ages and rates.' } };
  return { errors, result: { ...v, expenses, savings, yearsToRetire, retirementYears: v.lifeAge - v.retireAge, expenseAtRetirement, corpus, savingsGrown, shortfall, monthly } };
}

const rupees = (paise) => formatInr(Math.round(paise));

export function getRows(result) {
  return [
    { label: 'Money needed at retirement', value: rupees(result.corpus) },
    { label: 'Save each month', value: rupees(Math.ceil(result.monthly)) },
    { label: 'Monthly expenses at retirement', value: rupees(result.expenseAtRetirement) },
    { label: 'Current savings will grow to', value: rupees(result.savingsGrown) },
    { label: 'Still needed', value: rupees(result.shortfall) },
    { label: 'Years until retirement', value: String(result.yearsToRetire) },
    { label: 'Years in retirement', value: String(result.retirementYears) },
  ];
}

export const describeCovered = (result) => (result.shortfall === 0 ? 'Your current savings are expected to cover your retirement, so you do not need to save more.' : null);

export const buildResultText = (result) => [...getRows(result).map(({ label, value }) => `${label}: ${value}`), describeCovered(result)].filter(Boolean).join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Current age', value: String(result.age) },
      { label: 'Retirement age', value: String(result.retireAge) },
      { label: 'Plan up to age', value: String(result.lifeAge) },
      { label: 'Monthly expenses today', value: rupees(result.expenses) },
      { label: 'Inflation', value: `${result.inflation}% a year` },
      { label: 'Return before retirement', value: `${result.preReturn}% a year` },
      { label: 'Return after retirement', value: `${result.postReturn}% a year` },
      { label: 'Current savings', value: rupees(result.savings) },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(3),
    notes: [describeCovered(result), 'These are estimates, not financial advice. Real returns and inflation vary, and tax is not included.'].filter(Boolean),
    formula: 'Money needed = the value at retirement of monthly expenses that rise with inflation, drawn until the planned age.',
  };
}
