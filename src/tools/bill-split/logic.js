import { formatInr, toPaise } from '../../utils/currency.js';
import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

const MAX_AMOUNT = 1e13;
const MAX_PEOPLE = 1000;

export function calculateSplit({ bill, people, taxRate = 0, tipRate = 0, roundUp = false }) {
  const billPaise = toPaise(bill);
  const tax = Math.round((billPaise * taxRate) / 100);
  const tip = Math.round((billPaise * tipRate) / 100);
  const total = billPaise + tax + tip;
  const baseShare = Math.floor(total / people);
  const extraPayers = total % people;

  if (roundUp) {
    const share = Math.ceil(total / people / 100) * 100;
    const collected = share * people;
    return { bill: billPaise, people, taxRate, tipRate, tax, tip, total, share, baseShare: share, extraPayers: 0, collected, leftover: collected - total, roundUp };
  }

  return {
    bill: billPaise,
    people,
    taxRate,
    tipRate,
    tax,
    tip,
    total,
    share: extraPayers > 0 ? baseShare + 1 : baseShare,
    baseShare,
    extraPayers,
    collected: total,
    leftover: 0,
    roundUp,
  };
}

const optionalPercent = (text, name) => {
  const message = `The ${name} must be between 0 and 100.`;
  return String(text ?? '').trim() ? checkNumber(text, { max: 100, minMessage: message, maxMessage: message }) : { value: 0 };
};

export function evaluate({ bill, people, tax, tip, roundUp }) {
  const { errors, values, isValid } = collectFields({
    bill: checkNumber(bill, {
      required: 'Please enter the bill amount.',
      aboveMin: true,
      max: MAX_AMOUNT,
      minMessage: 'The bill amount must be greater than 0.',
      maxMessage: 'This amount is too large to calculate.',
    }),
    people: checkNumber(people, {
      required: 'Please enter the number of people.',
      min: 1,
      max: MAX_PEOPLE,
      whole: true,
      minMessage: 'Please enter at least 1 person.',
      maxMessage: `Please enter ${MAX_PEOPLE} people or fewer.`,
    }),
    tax: optionalPercent(tax, 'tax'),
    tip: optionalPercent(tip, 'tip'),
  });

  if (!isValid) return { errors };
  return { errors, result: calculateSplit({ bill: values.bill, people: values.people, taxRate: values.tax, tipRate: values.tip, roundUp }) };
}

export function describeShares({ people, share, baseShare, extraPayers, leftover }) {
  if (leftover > 0) return `Everyone pays ${formatInr(share)}, which leaves ${formatInr(leftover)} over after paying the bill.`;
  if (extraPayers > 0) {
    const others = people - extraPayers;
    const pays = (count) => (count === 1 ? '1 person pays' : `${count} people pay`);
    return `The bill doesn't divide evenly: ${pays(extraPayers)} ${formatInr(share)} and ${pays(others)} ${formatInr(baseShare)}.`;
  }
  return null;
}

export const buildResultText = (result) =>
  [
    `Bill: ${formatInr(result.bill)}`,
    `Tax: ${formatInr(result.tax)}`,
    `Tip: ${formatInr(result.tip)}`,
    `Total: ${formatInr(result.total)}`,
    `People: ${result.people}`,
    `Each person pays: ${formatInr(result.share)}`,
    describeShares(result),
  ]
    .filter(Boolean)
    .join('\n');
