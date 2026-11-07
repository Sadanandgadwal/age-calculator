import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

export const PRESETS = ['5', '10', '15', '20'];

export function evaluate({ bill, percent, people, roundUp }) {
  const { errors, values, isValid } = collectFields({
    bill: checkNumber(bill, { required: 'Please enter the bill amount.', aboveMin: true, max: 1e11, minMessage: 'The bill must be greater than 0.', maxMessage: 'This amount is too large to calculate.' }),
    percent: checkNumber(percent, { required: 'Please enter the tip percentage.', max: 100, minMessage: 'The tip must be between 0 and 100%.', maxMessage: 'The tip must be between 0 and 100%.' }),
    people: checkNumber(people, { required: 'Please enter the number of people.', min: 1, max: 1000, whole: true, minMessage: 'There must be at least 1 person.', maxMessage: 'Please enter 1,000 people or fewer.' }),
  });
  if (!isValid) return { errors };

  const billPaise = toPaise(values.bill);
  const tipPaise = Math.round((billPaise * values.percent) / 100);
  let perPerson = Math.ceil((billPaise + tipPaise) / values.people);
  if (roundUp) perPerson = Math.ceil(perPerson / 100) * 100;
  const total = perPerson * values.people;
  const tip = total - billPaise;
  return {
    errors,
    result: {
      bill: billPaise,
      percent: values.percent,
      people: values.people,
      roundUp,
      tip,
      total,
      perPerson,
      tipPerPerson: Math.round(tip / values.people),
      effectivePercent: roundTo2((tip / billPaise) * 100),
      extra: total - (billPaise + tipPaise),
    },
  };
}

export const formatPercent = (value) => `${formatDecimal(value)}%`;

export function describeExtra({ extra, roundUp, effectivePercent }) {
  if (extra === 0) return null;
  if (roundUp) return `Rounding up adds ${formatInr(extra)} to the tip, making it ${formatPercent(effectivePercent)} of the bill.`;
  return `The total does not divide evenly, so each share is rounded up and the tip gets an extra ${formatInr(extra)}.`;
}

export function getRows(result) {
  return [
    { label: 'Tip', value: formatInr(result.tip) },
    { label: 'Total', value: formatInr(result.total) },
    { label: 'Each person pays', value: formatInr(result.perPerson) },
    { label: 'Bill', value: formatInr(result.bill) },
    { label: 'Tip percentage', value: result.roundUp && result.extra ? `${formatPercent(result.percent)} chosen, ${formatPercent(result.effectivePercent)} after rounding` : formatPercent(result.percent) },
    ...(result.people > 1 ? [{ label: 'Tip per person', value: formatInr(result.tipPerPerson) }] : []),
    { label: 'People', value: String(result.people) },
  ];
}

export const buildResultText = (result) => [...getRows(result).map(({ label, value }) => `${label}: ${value}`), describeExtra(result)].filter(Boolean).join('\n');

export function buildReport(result) {
  const rows = getRows(result);
  return {
    inputs: [
      { label: 'Bill', value: formatInr(result.bill) },
      { label: 'Tip', value: formatPercent(result.percent) },
      { label: 'People', value: String(result.people) },
      { label: 'Round up each share', value: result.roundUp ? 'Yes, to the nearest rupee' : 'No' },
    ],
    results: rows.slice(0, 3),
    details: rows.slice(4).filter(({ label }) => label !== 'People'),
    notes: [describeExtra(result)].filter(Boolean),
    formula: 'Tip = bill × tip % ÷ 100. Each person pays (bill + tip) ÷ people.',
  };
}
