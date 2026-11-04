import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

const MAX_AMOUNT = 1e13;
const PERCENT_MESSAGE = 'The discount must be between 0 and 100.';

const priceField = (text, required) =>
  checkNumber(text, {
    required,
    aboveMin: true,
    max: MAX_AMOUNT,
    minMessage: 'The price must be greater than 0.',
    maxMessage: 'This amount is too large to calculate.',
  });

const saleField = (text) =>
  checkNumber(text, { required: 'Please enter the sale price.', max: MAX_AMOUNT, minMessage: "The sale price can't be negative.", maxMessage: 'This amount is too large to calculate.' });

const percentField = (text, max = 100) =>
  checkNumber(text, { required: 'Please enter the discount percentage.', max, minMessage: PERCENT_MESSAGE, maxMessage: PERCENT_MESSAGE });

const build = (original, sale, formula) => {
  const saved = original - sale;
  return { original, sale, saved, percent: original > 0 ? roundTo2((saved / original) * 100) : 0, formula };
};

export const MODES = [
  {
    id: 'percent-off',
    name: '% off',
    title: 'Find the price after a percentage discount',
    labelA: 'Original price (₹)',
    labelB: 'Discount',
    suffixB: '%',
    fields: (a, b) => ({ a: priceField(a, 'Please enter the original price.'), b: percentField(b) }),
    calculate({ a, b }) {
      const original = toPaise(a);
      return build(original, original - Math.round((original * b) / 100), 'Final price = original price − (original price × discount ÷ 100)');
    },
  },
  {
    id: 'amount-off',
    name: 'Amount off',
    title: 'Find the price after a fixed discount',
    labelA: 'Original price (₹)',
    labelB: 'Discount amount (₹)',
    fields: (a, b) => ({
      a: priceField(a, 'Please enter the original price.'),
      b: checkNumber(b, { required: 'Please enter the discount amount.', max: MAX_AMOUNT, minMessage: "The discount amount can't be negative.", maxMessage: 'This amount is too large to calculate.' }),
    }),
    check: ({ a, b }) => (b > a ? { b: "The discount can't be more than the original price." } : {}),
    calculate({ a, b }) {
      const original = toPaise(a);
      return build(original, original - toPaise(b), 'Final price = original price − discount amount');
    },
  },
  {
    id: 'find-percent',
    name: 'Find the discount',
    title: 'Find the discount percentage',
    labelA: 'Original price (₹)',
    labelB: 'Sale price (₹)',
    fields: (a, b) => ({ a: priceField(a, 'Please enter the original price.'), b: saleField(b) }),
    check: ({ a, b }) => (b > a ? { b: "The sale price can't be more than the original price." } : {}),
    calculate: ({ a, b }) => build(toPaise(a), toPaise(b), 'Discount % = (original price − sale price) ÷ original price × 100'),
  },
  {
    id: 'find-original',
    name: 'Find the original price',
    title: 'Find the original price',
    labelA: 'Sale price (₹)',
    labelB: 'Discount',
    suffixB: '%',
    fields: (a, b) => ({
      a: priceField(a, 'Please enter the sale price.'),
      b: checkNumber(b, { required: 'Please enter the discount percentage.', max: 99.99, minMessage: 'The discount must be 0 or more, and less than 100.', maxMessage: 'The discount must be 0 or more, and less than 100.' }),
    }),
    calculate({ a, b }) {
      const sale = toPaise(a);
      return build(Math.round(sale / (1 - b / 100)), sale, 'Original price = sale price ÷ (1 − discount ÷ 100)');
    },
  },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function evaluate(modeId, a, b) {
  const mode = getMode(modeId);
  const { errors, values, isValid } = collectFields(mode.fields(a, b));
  if (!isValid) return { errors };

  const checked = mode.check?.(values) ?? {};
  if (Object.keys(checked).length > 0) return { errors: checked };

  return { errors, result: mode.calculate(values) };
}

export const formatPercent = (percent) => `${formatDecimal(percent)}%`;

export const buildResultText = ({ original, sale, saved, percent }) =>
  [
    `Original price: ${formatInr(original)}`,
    `Discount: ${formatPercent(percent)}`,
    `You save: ${formatInr(saved)}`,
    `Final price: ${formatInr(sale)}`,
  ].join('\n');
