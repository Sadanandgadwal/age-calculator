import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

const money = (text, name) =>
  checkNumber(text, { required: `Please enter the ${name}.`, aboveMin: true, max: 1e13, minMessage: `The ${name} must be greater than 0.`, maxMessage: 'This amount is too large to calculate.' });
const rateField = (text) => checkNumber(text, { required: 'Please enter the interest rate.', aboveMin: true, max: 100, minMessage: 'The rate must be greater than 0.', maxMessage: 'The rate must be 100% or less.' });
const timeField = (text) => checkNumber(text, { required: 'Please enter the time in years.', aboveMin: true, max: 100, minMessage: 'The time must be greater than 0.', maxMessage: 'The time can be up to 100 years.' });

const FIELDS = {
  principal: { label: 'Principal (₹)', field: (text) => money(text, 'principal') },
  interest: { label: 'Interest (₹)', field: (text) => money(text, 'interest') },
  rate: { label: 'Interest rate (% a year)', suffix: '%', field: rateField },
  time: { label: 'Time (years)', field: timeField },
};

export const MODES = [
  { id: 'interest', name: 'Find interest', title: 'Find the simple interest', inputs: ['principal', 'rate', 'time'] },
  { id: 'principal', name: 'Find principal', title: 'Find the principal', inputs: ['interest', 'rate', 'time'] },
  { id: 'rate', name: 'Find rate', title: 'Find the interest rate', inputs: ['principal', 'interest', 'time'] },
  { id: 'time', name: 'Find time', title: 'Find the time', inputs: ['principal', 'interest', 'rate'] },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);
export const fieldInfo = (key) => FIELDS[key];

export function evaluate(modeId, values) {
  const mode = getMode(modeId);
  const { errors, values: v, isValid } = collectFields(Object.fromEntries(mode.inputs.map((key) => [key, FIELDS[key].field(values[key])])));
  if (!isValid) return { errors };
  let { principal, interest, rate, time } = v;
  if (modeId === 'interest') interest = (principal * rate * time) / 100;
  if (modeId === 'principal') principal = (interest * 100) / (rate * time);
  if (modeId === 'rate') rate = (interest * 100) / (principal * time);
  if (modeId === 'time') time = (interest * 100) / (principal * rate);
  if (principal > 1e13 || interest > 1e13) return { errors: { [mode.inputs[0]]: 'The result is too large to show. Try smaller values.' } };
  const principalPaise = toPaise(principal);
  const interestPaise = toPaise(interest);
  return { errors, result: { modeId, principal: principalPaise, interest: interestPaise, total: principalPaise + interestPaise, rate: roundTo2(rate), time: roundTo2(time), months: Math.round(time * 12) } };
}

const formatTime = (time, months) => `${formatDecimal(time)} ${time === 1 ? 'year' : 'years'}${Number.isInteger(time) ? '' : ` (about ${months} months)`}`;

export function getRows(result) {
  const rows = {
    interest: { label: 'Interest', value: formatInr(result.interest) },
    principal: { label: 'Principal', value: formatInr(result.principal) },
    rate: { label: 'Interest rate', value: `${formatDecimal(result.rate)}% a year` },
    time: { label: 'Time', value: formatTime(result.time, result.months) },
    total: { label: 'Total amount', value: formatInr(result.total) },
  };
  const order = { interest: ['interest', 'total', 'principal', 'rate', 'time'], principal: ['principal', 'total', 'interest', 'rate', 'time'], rate: ['rate', 'total', 'principal', 'interest', 'time'], time: ['time', 'total', 'principal', 'interest', 'rate'] }[result.modeId];
  return order.map((key) => rows[key]);
}

export const FORMULAS = {
  interest: 'Simple interest = P × R × T ÷ 100',
  principal: 'Principal = interest × 100 ÷ (R × T)',
  rate: 'Rate = interest × 100 ÷ (P × T)',
  time: 'Time = interest × 100 ÷ (P × R)',
};

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, values, result) {
  const rows = getRows(result);
  return {
    subtitle: mode.title,
    inputs: mode.inputs.map((key) => ({ label: FIELDS[key].label, value: `${String(values[key]).trim()}${FIELDS[key].suffix ?? ''}` })),
    results: rows.slice(0, 2),
    details: rows.slice(2),
    formula: FORMULAS[mode.id],
  };
}
