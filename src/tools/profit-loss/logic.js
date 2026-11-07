import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

const MAX_AMOUNT = 1e13;
const LARGE = 'This amount is too large to calculate.';

const amount = (text, name) =>
  checkNumber(text, { required: `Please enter the ${name}.`, aboveMin: true, max: MAX_AMOUNT, minMessage: `The ${name} must be greater than 0.`, maxMessage: LARGE });

const percent = (text) =>
  checkNumber(text, { required: 'Please enter the profit or loss percentage.', min: -99.99, max: 10000, minMessage: 'A loss must be less than 100%.', maxMessage: 'Please enter 10,000% or less.' });

export const MODES = [
  {
    id: 'result',
    name: 'Profit or loss',
    title: 'Find the profit or loss',
    labelA: 'Cost price (₹)',
    labelB: 'Selling price (₹)',
    fields: (a, b) => ({ a: amount(a, 'cost price'), b: amount(b, 'selling price') }),
    calculate: ({ a, b }) => ({ cost: toPaise(a), sale: toPaise(b) }),
  },
  {
    id: 'selling',
    name: 'Find selling price',
    title: 'Find the selling price for a profit or loss',
    labelA: 'Cost price (₹)',
    labelB: 'Profit % (use a minus sign for a loss)',
    suffixB: '%',
    fields: (a, b) => ({ a: amount(a, 'cost price'), b: percent(b) }),
    calculate: ({ a, b }) => {
      const cost = toPaise(a);
      return { cost, sale: Math.round(cost * (1 + b / 100)) };
    },
  },
  {
    id: 'cost',
    name: 'Find cost price',
    title: 'Find the cost price from the selling price',
    labelA: 'Selling price (₹)',
    labelB: 'Profit % (use a minus sign for a loss)',
    suffixB: '%',
    fields: (a, b) => ({ a: amount(a, 'selling price'), b: percent(b) }),
    calculate: ({ a, b }) => {
      const sale = toPaise(a);
      return { cost: Math.round(sale / (1 + b / 100)), sale };
    },
  },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function evaluate(modeId, a, b) {
  const mode = getMode(modeId);
  const { errors, values, isValid } = collectFields(mode.fields(a, b));
  if (!isValid) return { errors };
  const { cost, sale } = mode.calculate(values);
  const difference = sale - cost;
  return {
    errors,
    result: {
      cost,
      sale,
      difference,
      kind: difference > 0 ? 'Profit' : difference < 0 ? 'Loss' : 'No profit or loss',
      percent: cost > 0 ? roundTo2((difference / cost) * 100) : 0,
      margin: sale > 0 ? roundTo2((difference / sale) * 100) : 0,
    },
  };
}

export const formatPercent = (value) => `${formatDecimal(value)}%`;

export function getRows({ cost, sale, difference, kind, percent, margin }) {
  const label = kind === 'Loss' ? 'Loss' : 'Profit';
  return [
    { label: kind === 'No profit or loss' ? 'Profit' : label, value: formatInr(Math.abs(difference)) },
    { label: `${label} %`, value: formatPercent(Math.abs(percent)) },
    { label: 'Margin', value: formatPercent(margin) },
    { label: 'Cost price', value: formatInr(cost) },
    { label: 'Selling price', value: formatInr(sale) },
    { label: 'Result', value: kind },
  ];
}

export const FORMULA = 'Profit = selling price − cost price. Profit % = profit ÷ cost price × 100. Margin = profit ÷ selling price × 100.';

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, a, b, result) {
  const rows = getRows(result);
  return {
    subtitle: mode.title,
    inputs: [
      { label: mode.labelA, value: String(a).trim() },
      { label: mode.labelB, value: `${String(b).trim()}${mode.suffixB ?? ''}` },
    ],
    results: [rows[5], rows[0], rows[1]],
    details: [rows[2], rows[3], rows[4]],
    formula: FORMULA,
  };
}
