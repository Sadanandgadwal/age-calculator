import { parseDecimal } from './number.js';

const quantityFormatter = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 10 });
const exampleFormatter = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 6 });
const LARGE = 1e15;
const SMALL = 1e-6;

const clean = (value) => Number(value.toPrecision(12));

export function formatQuantity(value, formatter = quantityFormatter) {
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude >= LARGE || magnitude < SMALL)) {
    return value.toExponential(6).replace(/\.?0+e/, 'e');
  }
  return formatter.format(value);
}

export const convertUnits = (value, from, to) => clean((value * from.factor) / to.factor);

function isExact(value, text) {
  const plain = Number(text.replace(/,/g, ''));
  return plain === value;
}

export const relation = (value, text) => (isExact(value, text) ? '=' : '≈');

export function evaluateConversion(text, fromId, toId, units) {
  if (!String(text ?? '').trim()) return {};

  const value = parseDecimal(text);
  if (value === null) return { error: 'Please enter a valid number.' };
  if (value < 0) return { error: 'Please enter a value of 0 or more.' };

  const from = units.find(({ id }) => id === fromId);
  const to = units.find(({ id }) => id === toId);
  const output = convertUnits(value, from, to);

  if (!Number.isFinite(output)) return { error: 'This value is too large to convert.' };
  if (output === 0 && value !== 0) return { error: 'This value is too small to convert.' };

  const factor = clean(from.factor / to.factor);
  const factorText = formatQuantity(factor);
  const outputText = formatQuantity(output);

  return {
    result: {
      value,
      output,
      from,
      to,
      outputText,
      factor,
      summary: `${formatQuantity(value)} ${from.symbol} ${relation(output, outputText)} ${outputText} ${to.symbol}`,
      formula: `${to.name} = ${from.name} × ${factorText}`,
      unitRate: `1 ${from.symbol} ${relation(factor, factorText)} ${factorText} ${to.symbol}`,
    },
  };
}

export function buildExamples(units, pairs) {
  const find = (id) => units.find((unit) => unit.id === id);
  return pairs.map(([fromId, toId]) => {
    const from = find(fromId);
    const to = find(toId);
    const output = convertUnits(1, from, to);
    const outputText = formatQuantity(output, exampleFormatter);
    return {
      title: `${from.name} to ${to.name}`,
      text: `1 ${from.symbol} ${relation(output, outputText)} ${outputText} ${to.symbol}`,
    };
  });
}

export const buildConversionText = ({ summary, formula, unitRate }) =>
  [summary, `Formula: ${formula}`, unitRate].join('\n');
