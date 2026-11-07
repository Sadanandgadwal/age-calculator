import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

export const MODES = [
  { id: 'add', name: 'Add tax', title: 'Add tax to a price', labelA: 'Price before tax (₹)' },
  { id: 'remove', name: 'Remove tax', title: 'Take tax out of a price that includes it', labelA: 'Price including tax (₹)' },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function evaluate(modeId, amount, rate) {
  const { errors, values, isValid } = collectFields({
    amount: checkNumber(amount, { required: 'Please enter the price.', aboveMin: true, max: 1e13, minMessage: 'The price must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    rate: checkNumber(rate, { required: 'Please enter the tax rate.', max: 100, minMessage: 'The tax rate must be between 0 and 100%.', maxMessage: 'The tax rate must be between 0 and 100%.' }),
  });
  if (!isValid) return { errors };
  const entered = toPaise(values.amount);
  if (modeId === 'add') {
    const tax = Math.round((entered * values.rate) / 100);
    return { errors, result: { modeId, rate: values.rate, net: entered, tax, gross: entered + tax } };
  }
  const net = Math.round(entered / (1 + values.rate / 100));
  return { errors, result: { modeId, rate: values.rate, net, tax: entered - net, gross: entered } };
}

export function getRows({ rate, net, tax, gross }) {
  return [
    { label: 'Tax', value: formatInr(tax) },
    { label: 'Price before tax', value: formatInr(net) },
    { label: 'Price including tax', value: formatInr(gross) },
    { label: 'Tax rate', value: `${formatDecimal(rate)}%` },
  ];
}

export const FORMULAS = {
  add: 'Tax = price × rate ÷ 100. Total = price + tax.',
  remove: 'Price before tax = price including tax ÷ (1 + rate ÷ 100). Tax = the difference.',
};

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, amount, rate, result) {
  const rows = getRows(result);
  return {
    subtitle: mode.title,
    inputs: [
      { label: mode.labelA, value: String(amount).trim() },
      { label: 'Tax rate', value: `${String(rate).trim()}%` },
    ],
    results: rows.slice(0, 3),
    formula: FORMULAS[mode.id],
  };
}
