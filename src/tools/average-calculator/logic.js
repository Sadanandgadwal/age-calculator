import { formatDecimal, parseDecimal } from '../../utils/number.js';

export const MODES = [
  { id: 'simple', name: 'Average', title: 'Find the average of a list of numbers' },
  { id: 'weighted', name: 'Weighted average', title: 'Find a weighted average' },
];

export const MAX_NUMBERS = 10000;
const MAX_SIZE = 1e15;

export function parseList(text, what = 'numbers') {
  const parts = String(text ?? '').split(/[\s,;]+/).filter(Boolean);
  if (parts.length === 0) return { error: `Please enter some ${what}.` };
  if (parts.length > MAX_NUMBERS) return { error: `Please enter no more than ${MAX_NUMBERS.toLocaleString('en-IN')} ${what}.` };
  const values = [];
  for (const part of parts) {
    const value = parseDecimal(part);
    if (value === null) return { error: `"${part.length > 20 ? `${part.slice(0, 20)}…` : part}" is not a number. Separate numbers with commas, spaces or new lines.` };
    if (Math.abs(value) > MAX_SIZE) return { error: 'One of the numbers is too large to calculate.' };
    values.push(value);
  }
  return { values };
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function modes(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const top = Math.max(...counts.values());
  if (top === 1) return { values: [], count: 1 };
  return { values: [...counts].filter(([, count]) => count === top).map(([value]) => value).sort((a, b) => a - b), count: top };
}

const sumOf = (values) => values.reduce((total, value) => total + value, 0);

export function summarize(values) {
  const sum = sumOf(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { count: values.length, sum, mean: sum / values.length, median: median(values), mode: modes(values), min, max, range: max - min };
}

export function evaluate(modeId, numbers, weights) {
  const list = parseList(numbers);
  if (modeId === 'simple') {
    if (list.error) return { errors: { numbers: list.error } };
    return { errors: {}, result: { modeId, ...summarize(list.values) } };
  }
  const weightList = parseList(weights, 'weights');
  const errors = {};
  if (list.error) errors.numbers = list.error;
  if (weightList.error) errors.weights = weightList.error;
  else if (weightList.values.some((value) => value < 0)) errors.weights = "Weights can't be negative.";
  if (Object.keys(errors).length) return { errors };
  if (list.values.length !== weightList.values.length) {
    return { errors: { weights: `Enter one weight for each number. You have ${list.values.length} numbers and ${weightList.values.length} weights.` } };
  }
  const totalWeight = sumOf(weightList.values);
  if (totalWeight === 0) return { errors: { weights: 'The weights must add up to more than 0.' } };
  const weightedSum = sumOf(list.values.map((value, index) => value * weightList.values[index]));
  return { errors: {}, result: { modeId, count: list.values.length, totalWeight, weightedSum, weighted: weightedSum / totalWeight, mean: sumOf(list.values) / list.values.length } };
}

export const formatNumber = (value) => formatDecimal(value);

export function describeMode({ values, count }) {
  if (values.length === 0) return 'None, every number appears once';
  const shown = values.slice(0, 10).map(formatNumber).join('; ');
  const more = values.length > 10 ? ` and ${values.length - 10} more` : '';
  return `${shown}${more} (${count} times${values.length > 1 ? ' each' : ''})`;
}

export function getRows(result) {
  if (result.modeId === 'weighted') {
    return [
      { label: 'Weighted average', value: formatNumber(result.weighted) },
      { label: 'Simple average', value: formatNumber(result.mean) },
      { label: 'Total weight', value: formatNumber(result.totalWeight) },
      { label: 'Count', value: formatNumber(result.count) },
    ];
  }
  return [
    { label: 'Average (mean)', value: formatNumber(result.mean) },
    { label: 'Median', value: formatNumber(result.median) },
    { label: 'Mode', value: describeMode(result.mode) },
    { label: 'Range', value: formatNumber(result.range) },
    { label: 'Smallest', value: formatNumber(result.min) },
    { label: 'Largest', value: formatNumber(result.max) },
    { label: 'Sum', value: formatNumber(result.sum) },
    { label: 'Count', value: formatNumber(result.count) },
  ];
}

export const FORMULAS = {
  simple: 'Average = sum of the numbers ÷ how many numbers there are',
  weighted: 'Weighted average = Σ(number × weight) ÷ Σ weights',
};

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

const preview = (text) => {
  const parts = String(text ?? '').split(/[\s,;]+/).filter(Boolean);
  return parts.length > 30 ? `${parts.slice(0, 30).join(', ')} and ${parts.length - 30} more` : parts.join(', ');
};

export function buildReport(mode, numbers, weights, result) {
  const [main, ...rest] = getRows(result);
  return {
    subtitle: mode.title,
    inputs: [{ label: 'Numbers', value: preview(numbers) }, ...(mode.id === 'weighted' ? [{ label: 'Weights', value: preview(weights) }] : [])],
    results: [main],
    details: rest,
    formula: FORMULAS[mode.id],
  };
}
