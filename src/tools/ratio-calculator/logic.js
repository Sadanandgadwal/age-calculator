import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

const MAX = 1e9;
const MAX_DECIMALS = 6;

const part = (text, name) => {
  const field = checkNumber(text, { required: `Please enter ${name}.`, aboveMin: true, max: MAX, minMessage: 'Please enter a number greater than 0.', maxMessage: 'Please enter a number up to 1,000,000,000.' });
  if (field.error) return field;
  const decimals = (String(text).trim().split('.')[1] ?? '').length;
  return decimals > MAX_DECIMALS ? { error: 'Please use no more than 6 decimal places.' } : field;
};

export const MODES = [
  {
    id: 'simplify',
    name: 'Simplify',
    title: 'Simplify a ratio',
    labels: { a: 'First number (A)', b: 'Second number (B)' },
    fields: (values) => ({ a: part(values.a, 'the first number'), b: part(values.b, 'the second number') }),
  },
  {
    id: 'solve',
    name: 'Find the missing value',
    title: 'Solve A : B = C : ?',
    labels: { a: 'A', b: 'B', c: 'C' },
    fields: (values) => ({ a: part(values.a, 'A'), b: part(values.b, 'B'), c: part(values.c, 'C') }),
  },
  {
    id: 'share',
    name: 'Share a total',
    title: 'Split a total in a ratio',
    labels: { c: 'Total to share', a: 'Ratio part A', b: 'Ratio part B' },
    fields: (values) => ({ c: part(values.c, 'the total'), a: part(values.a, 'ratio part A'), b: part(values.b, 'ratio part B') }),
  },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

const gcd = (x, y) => (y === 0n ? x : gcd(y, x % y));

const decimalsOf = (value) => {
  const text = String(value);
  return text.includes('e') ? 0 : (text.split('.')[1] ?? '').length;
};

export function simplify(a, b) {
  const scale = 10 ** Math.max(decimalsOf(a), decimalsOf(b));
  const x = BigInt(Math.round(a * scale));
  const y = BigInt(Math.round(b * scale));
  const divisor = gcd(x, y);
  return [Number(x / divisor), Number(y / divisor)];
}

const format = (value) => formatDecimal(value);

export function calculate(modeId, { a, b, c }) {
  const total = a + b;
  const shares = `${format((a / total) * 100)}% : ${format((b / total) * 100)}%`;
  if (modeId === 'simplify') {
    const [x, y] = simplify(a, b);
    return { modeId, a, b, simplest: `${format(x)} : ${format(y)}`, oneTo: `1 : ${format(b / a)}`, toOne: `${format(a / b)} : 1`, shares };
  }
  if (modeId === 'solve') {
    const answer = (b * c) / a;
    return { modeId, a, b, c, answer, statement: `${format(a)} : ${format(b)} = ${format(c)} : ${format(answer)}` };
  }
  const first = (c * a) / total;
  return { modeId, a, b, c, first, second: c - first, shares };
}

export function evaluate(modeId, values) {
  const { errors, values: numbers, isValid } = collectFields(getMode(modeId).fields(values));
  if (!isValid) return { errors };
  return { errors, result: calculate(modeId, numbers) };
}

export const FORMULAS = {
  simplify: 'Divide both numbers by their greatest common divisor.',
  solve: '? = B × C ÷ A',
  share: 'Each part = total × its share of the ratio ÷ sum of the ratio',
};

export function getRows(result) {
  if (result.modeId === 'simplify') {
    return [
      { label: 'Simplest form', value: result.simplest },
      { label: 'As 1 : n', value: result.oneTo },
      { label: 'As n : 1', value: result.toOne },
      { label: 'Shares of the total', value: result.shares },
    ];
  }
  if (result.modeId === 'solve') {
    return [
      { label: 'Missing value', value: format(result.answer) },
      { label: 'Full ratio', value: result.statement },
    ];
  }
  return [
    { label: 'Part A', value: format(result.first) },
    { label: 'Part B', value: format(result.second) },
    { label: 'Ratio', value: `${format(result.a)} : ${format(result.b)}` },
    { label: 'Shares of the total', value: result.shares },
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, values, result) {
  const [main, ...rest] = getRows(result);
  const second = result.modeId === 'share' ? [rest.shift()] : [];
  return {
    subtitle: mode.title,
    inputs: Object.entries(mode.labels).map(([key, label]) => ({ label, value: String(values[key]).trim() })),
    results: [main, ...second],
    details: rest,
    formula: FORMULAS[mode.id],
  };
}
