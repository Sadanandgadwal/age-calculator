import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

const MAX_AMOUNT = 1e13;

const amount = (text, name) =>
  checkNumber(text, { required: `Please enter the ${name}.`, aboveMin: true, max: MAX_AMOUNT, minMessage: `The ${name} must be greater than 0.`, maxMessage: 'This amount is too large to calculate.' });

export const MODES = [
  {
    id: 'markup',
    name: 'Price from markup',
    title: 'Find the selling price from a markup',
    labelA: 'Cost (₹)',
    labelB: 'Markup',
    suffixB: '%',
    fields: (a, b) => ({ a: amount(a, 'cost'), b: checkNumber(b, { required: 'Please enter the markup percentage.', max: 100000, minMessage: "The markup can't be negative.", maxMessage: 'Please enter 100,000% or less.' }) }),
    calculate: ({ a, b }) => {
      const cost = toPaise(a);
      return { cost, price: Math.round(cost * (1 + b / 100)) };
    },
  },
  {
    id: 'margin',
    name: 'Price from margin',
    title: 'Find the selling price from a profit margin',
    labelA: 'Cost (₹)',
    labelB: 'Margin',
    suffixB: '%',
    fields: (a, b) => ({ a: amount(a, 'cost'), b: checkNumber(b, { required: 'Please enter the margin percentage.', max: 99.99, minMessage: 'The margin must be 0 or more, and less than 100.', maxMessage: 'The margin must be 0 or more, and less than 100.' }) }),
    calculate: ({ a, b }) => {
      const cost = toPaise(a);
      return { cost, price: Math.round(cost / (1 - b / 100)) };
    },
  },
  {
    id: 'find',
    name: 'Find the markup',
    title: 'Find the markup and margin from two prices',
    labelA: 'Cost (₹)',
    labelB: 'Selling price (₹)',
    fields: (a, b) => ({ a: amount(a, 'cost'), b: amount(b, 'selling price') }),
    check: ({ a, b }) => (b < a ? { b: "The selling price can't be less than the cost. Use the Profit and Loss Calculator for a loss." } : {}),
    calculate: ({ a, b }) => ({ cost: toPaise(a), price: toPaise(b) }),
  },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function evaluate(modeId, a, b) {
  const mode = getMode(modeId);
  const { errors, values, isValid } = collectFields(mode.fields(a, b));
  if (!isValid) return { errors };
  const checked = mode.check?.(values) ?? {};
  if (Object.keys(checked).length) return { errors: checked };
  const { cost, price } = mode.calculate(values);
  const profit = price - cost;
  return { errors, result: { cost, price, profit, markup: roundTo2((profit / cost) * 100), margin: roundTo2((profit / price) * 100) } };
}

export const formatPercent = (value) => `${formatDecimal(value)}%`;

export function getRows({ cost, price, profit, markup, margin }) {
  return [
    { label: 'Selling price', value: formatInr(price) },
    { label: 'Markup', value: formatPercent(markup) },
    { label: 'Margin', value: formatPercent(margin) },
    { label: 'Cost', value: formatInr(cost) },
    { label: 'Profit', value: formatInr(profit) },
  ];
}

export const FORMULA = 'Markup = profit ÷ cost × 100. Margin = profit ÷ selling price × 100.';

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, a, b, result) {
  const rows = getRows(result);
  return {
    subtitle: mode.title,
    inputs: [
      { label: mode.labelA, value: String(a).trim() },
      { label: mode.labelB, value: `${String(b).trim()}${mode.suffixB ?? ''}` },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(3),
    formula: FORMULA,
  };
}
