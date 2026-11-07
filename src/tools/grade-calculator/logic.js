import { checkNumber } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

const isBlank = ({ name, score, weight }) => ![name, score, weight].some((value) => String(value ?? '').trim());

const percentField = (text, required, what) =>
  checkNumber(text, { required, max: 100, minMessage: `${what} must be between 0 and 100.`, maxMessage: `${what} must be between 0 and 100.` });

export function evaluate(items, targetText) {
  const errors = {};
  const counted = [];
  items.forEach((item, index) => {
    if (isBlank(item)) return;
    const score = percentField(item.score, 'Please enter the score.', 'The score');
    const weight = checkNumber(item.weight, { required: 'Please enter the weight.', aboveMin: true, max: 100, minMessage: 'The weight must be greater than 0.', maxMessage: 'The weight must be 100 or less.' });
    const rowErrors = {};
    if (score.error) rowErrors.score = score.error;
    if (weight.error) rowErrors.weight = weight.error;
    if (Object.keys(rowErrors).length) errors[item.id] = rowErrors;
    else counted.push({ name: String(item.name ?? '').trim() || `Item ${index + 1}`, score: score.value, weight: weight.value });
  });
  if (counted.length === 0 && Object.keys(errors).length === 0) errors[items[0].id] = { score: 'Please enter at least one score and its weight.' };

  let target = null;
  if (String(targetText ?? '').trim()) {
    const field = percentField(targetText, '', 'The target');
    if (field.error) errors.target = field.error;
    else target = field.value;
  }
  if (Object.keys(errors).length) return { errors };

  const totalWeight = roundTo2(counted.reduce((total, item) => total + item.weight, 0));
  const earned = counted.reduce((total, item) => total + item.score * item.weight, 0);
  const percent = roundTo2(earned / totalWeight);
  const remainingWeight = roundTo2(Math.max(0, 100 - totalWeight));
  let needed = null;
  if (target !== null && totalWeight < 100) needed = roundTo2((target * 100 - earned) / remainingWeight);
  return { errors, result: { items: counted, totalWeight, percent, remainingWeight, target, needed } };
}

export const formatPercent = (value) => `${formatDecimal(value)}%`;

export function describeTarget({ target, needed, totalWeight, remainingWeight }) {
  if (target === null) return null;
  if (totalWeight >= 100) return 'Your weights already add up to 100% or more, so there is nothing left to score.';
  if (needed > 100) return `You would need ${formatPercent(needed)} on the remaining ${formatPercent(remainingWeight)}, which is not possible.`;
  if (needed <= 0) return `You have already reached ${formatPercent(target)}, even with 0% on the remaining ${formatPercent(remainingWeight)}.`;
  return `You need ${formatPercent(needed)} on the remaining ${formatPercent(remainingWeight)} to finish with ${formatPercent(target)}.`;
}

export function describeWeights(totalWeight) {
  if (totalWeight === 100) return null;
  return totalWeight < 100
    ? `Your weights add up to ${formatPercent(totalWeight)}, so this is your score on the work done so far.`
    : `Your weights add up to ${formatPercent(totalWeight)}, so each weight was scaled down to fit 100%.`;
}

export function buildResultText(result, grade) {
  return [
    `Weighted score: ${formatPercent(result.percent)}`,
    ...(grade ? [`Grade: ${grade}`] : []),
    `Total weight: ${formatPercent(result.totalWeight)}`,
    ...result.items.map(({ name, score, weight }) => `${name}: ${formatPercent(score)} × ${formatPercent(weight)}`),
    ...[describeTarget(result), describeWeights(result.totalWeight)].filter(Boolean),
  ].join('\n');
}

export function buildReport(result, grade) {
  return {
    inputs: result.items.map(({ name, score, weight }, index) => ({ label: `${index + 1}. ${name}`, value: `${formatPercent(score)}, weight ${formatPercent(weight)}` })),
    results: [{ label: 'Weighted score', value: formatPercent(result.percent) }, ...(grade ? [{ label: 'Grade', value: grade }] : [])],
    details: [
      { label: 'Total weight', value: formatPercent(result.totalWeight) },
      ...(result.target !== null ? [{ label: 'Target', value: formatPercent(result.target) }] : []),
    ],
    notes: [describeTarget(result), describeWeights(result.totalWeight)].filter(Boolean),
    formula: 'Weighted score = Σ(score × weight) ÷ Σ weights',
  };
}
