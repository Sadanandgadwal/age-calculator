import { parseDecimal } from '../../utils/number.js';

const roundFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 });
const smallFormatter = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 4 });

const clean = (value) => Number(value.toPrecision(12));

export function formatNumber(value) {
  const number = clean(value);
  return Math.abs(number) >= 1 || number === 0 ? roundFormatter.format(number) : smallFormatter.format(number);
}

const f = formatNumber;
const ZERO_ERROR = "This value can't be zero, as it would mean dividing by zero.";
const POSITIVE_PERCENT = 'Please enter a percentage of 0 or more.';
const requirePositiveB = (_, b) => (b < 0 ? { b: POSITIVE_PERCENT } : {});

function adjust({ a, b, sign, describe }) {
  const amount = (a * b) / 100;
  const value = a + sign * amount;
  const symbol = sign > 0 ? '+' : '−';
  return {
    value,
    display: f(value),
    sentence: `${describe(f(a), f(b))} = ${f(value)}`,
    steps: [`${f(b)}% of ${f(a)} = (${f(b)} ÷ 100) × ${f(a)} = ${f(amount)}`, `${f(a)} ${symbol} ${f(amount)} = ${f(value)}`],
  };
}

export const MODES = [
  {
    id: 'percent-of',
    name: '% of a number',
    title: 'What is X% of Y?',
    labelA: 'Percentage (X)',
    labelB: 'Number (Y)',
    suffixA: '%',
    formula: 'Result = (X ÷ 100) × Y',
    calculate(a, b) {
      const value = (a / 100) * b;
      return {
        value,
        display: f(value),
        sentence: `${f(a)}% of ${f(b)} is ${f(value)}`,
        steps: [`(${f(a)} ÷ 100) × ${f(b)}`, `${f(a / 100)} × ${f(b)}`, `= ${f(value)}`],
      };
    },
  },
  {
    id: 'what-percent',
    name: 'X is what %',
    title: 'X is what percentage of Y?',
    labelA: 'Value (X)',
    labelB: 'Total (Y)',
    formula: 'Percentage = (X ÷ Y) × 100',
    check: (_, b) => (b === 0 ? { b: ZERO_ERROR } : {}),
    calculate(a, b) {
      const value = (a / b) * 100;
      return {
        value,
        display: `${f(value)}%`,
        sentence: `${f(a)} is ${f(value)}% of ${f(b)}`,
        steps: [`(${f(a)} ÷ ${f(b)}) × 100`, `${f(a / b)} × 100`, `= ${f(value)}%`],
      };
    },
  },
  {
    id: 'find-whole',
    name: 'Find the whole',
    title: 'X is Y% of what number?',
    labelA: 'Value (X)',
    labelB: 'Percentage (Y)',
    suffixB: '%',
    formula: 'Whole = (X ÷ Y) × 100',
    check: (_, b) => (b === 0 ? { b: ZERO_ERROR } : {}),
    calculate(a, b) {
      const value = (a / b) * 100;
      return {
        value,
        display: f(value),
        sentence: `${f(a)} is ${f(b)}% of ${f(value)}`,
        steps: [`(${f(a)} ÷ ${f(b)}) × 100`, `${f(a / b)} × 100`, `= ${f(value)}`],
      };
    },
  },
  {
    id: 'increase',
    name: 'Increase',
    title: 'Increase a number by a percentage',
    labelA: 'Number',
    labelB: 'Increase by',
    suffixB: '%',
    formula: 'Result = Number + (Number × Percentage ÷ 100)',
    check: requirePositiveB,
    calculate: (a, b) => adjust({ a, b, sign: 1, describe: (n, p) => `Increase ${n} by ${p}%` }),
  },
  {
    id: 'decrease',
    name: 'Decrease',
    title: 'Decrease a number by a percentage',
    labelA: 'Number',
    labelB: 'Decrease by',
    suffixB: '%',
    formula: 'Result = Number − (Number × Percentage ÷ 100)',
    check: requirePositiveB,
    calculate: (a, b) => adjust({ a, b, sign: -1, describe: (n, p) => `Decrease ${n} by ${p}%` }),
  },
  {
    id: 'difference',
    name: 'Difference',
    title: 'Percentage difference between two values',
    labelA: 'First value',
    labelB: 'Second value',
    formula: 'Difference = |A − B| ÷ ((|A| + |B|) ÷ 2) × 100',
    check: (a, b) => (a === 0 && b === 0 ? { b: "Both values can't be zero, as it would mean dividing by zero." } : {}),
    calculate(a, b) {
      const gap = Math.abs(a - b);
      const average = (Math.abs(a) + Math.abs(b)) / 2;
      const value = (gap / average) * 100;
      return {
        value,
        display: `${f(value)}%`,
        sentence: `The percentage difference between ${f(a)} and ${f(b)} is ${f(value)}%`,
        steps: [`|${f(a)} − ${f(b)}| = ${f(gap)}`, `(|${f(a)}| + |${f(b)}|) ÷ 2 = ${f(average)}`, `(${f(gap)} ÷ ${f(average)}) × 100 = ${f(value)}%`],
      };
    },
  },
  {
    id: 'add',
    name: 'Add %',
    title: 'Add a percentage to a number',
    labelA: 'Number',
    labelB: 'Percentage to add',
    suffixB: '%',
    formula: 'Result = Number × (1 + Percentage ÷ 100)',
    check: requirePositiveB,
    calculate: (a, b) => adjust({ a, b, sign: 1, describe: (n, p) => `${n} + ${p}%` }),
  },
  {
    id: 'subtract',
    name: 'Subtract %',
    title: 'Subtract a percentage from a number',
    labelA: 'Number',
    labelB: 'Percentage to subtract',
    suffixB: '%',
    formula: 'Result = Number × (1 − Percentage ÷ 100)',
    check: requirePositiveB,
    calculate: (a, b) => adjust({ a, b, sign: -1, describe: (n, p) => `${n} − ${p}%` }),
  },
  {
    id: 'change',
    name: 'Change',
    title: 'Percentage change between two values',
    labelA: 'Starting value',
    labelB: 'Final value',
    formula: 'Change = ((Final − Start) ÷ |Start|) × 100',
    check: (a) => (a === 0 ? { a: ZERO_ERROR } : {}),
    calculate(a, b) {
      const gap = b - a;
      const value = (gap / Math.abs(a)) * 100;
      const direction = value > 0 ? 'an increase' : 'a decrease';
      return {
        value,
        display: `${f(value)}%`,
        sentence: value === 0 ? `There is no change from ${f(a)} to ${f(b)}` : `From ${f(a)} to ${f(b)} is ${direction} of ${f(Math.abs(value))}%`,
        steps: [`${f(b)} − ${f(a)} = ${f(gap)}`, `(${f(gap)} ÷ |${f(a)}|) × 100 = ${f(value)}%`],
      };
    },
  },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

function fieldError(text, value) {
  if (!String(text ?? '').trim()) return 'Please enter a value.';
  return value === null ? 'Please enter a valid number.' : null;
}

export function evaluate(modeId, textA, textB) {
  const mode = getMode(modeId);
  const a = parseDecimal(textA);
  const b = parseDecimal(textB);
  const errors = {};
  const errorA = fieldError(textA, a);
  const errorB = fieldError(textB, b);
  if (errorA) errors.a = errorA;
  if (errorB) errors.b = errorB;
  if (Object.keys(errors).length > 0) return { errors };

  const checked = mode.check?.(a, b) ?? {};
  if (Object.keys(checked).length > 0) return { errors: checked };

  const result = mode.calculate(a, b);
  if (!Number.isFinite(result.value)) return { errors: { a: 'These numbers are too large to calculate.' } };
  return { errors: {}, result };
}

export const buildResultText = (mode, result) =>
  [result.sentence, `Formula: ${mode.formula}`, ...result.steps].join('\n');

export const buildReport = (mode, a, b, result) => ({
  subtitle: mode.title,
  inputs: [
    { label: mode.labelA, value: `${String(a).trim()}${mode.suffixA ?? ''}` },
    { label: mode.labelB, value: `${String(b).trim()}${mode.suffixB ?? ''}` },
  ],
  results: [{ label: result.sentence, value: result.display }],
  formula: mode.formula,
  steps: result.steps,
});
