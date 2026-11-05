import { checkNumber } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { formatDecimal } from '../../utils/number.js';
import { randomBelow } from '../../utils/secureRandom.js';

const MAX_FLIPS = 1000;
const MESSAGE = `Please enter 1 to ${formatNumber(MAX_FLIPS)}.`;

export const validate = (text) => checkNumber(text, { required: MESSAGE, min: 1, max: MAX_FLIPS, whole: true, minMessage: MESSAGE, maxMessage: MESSAGE });

export function summarise(flips) {
  const heads = flips.filter((flip) => flip === 'Heads').length;
  return { flips, heads, tails: flips.length - heads };
}

export const flipCoins = (count, pick = randomBelow) => summarise(Array.from({ length: count }, () => (pick(2) === 0 ? 'Heads' : 'Tails')));

const percentOf = (part, whole) => `${formatDecimal((part / whole) * 100)}%`;

export const describeSequence = ({ flips }) => flips.map((flip) => flip[0]).join(' ');

export const getDetails = ({ flips, heads, tails }) => [
  { label: 'Heads Share', value: percentOf(heads, flips.length) },
  { label: 'Tails Share', value: percentOf(tails, flips.length) },
];

export function buildResultText(result) {
  if (result.flips.length === 1) return `Coin flip: ${result.flips[0]}`;
  return [
    `Flips: ${formatNumber(result.flips.length)}`,
    `Heads: ${formatNumber(result.heads)} (${percentOf(result.heads, result.flips.length)})`,
    `Tails: ${formatNumber(result.tails)} (${percentOf(result.tails, result.flips.length)})`,
    `Sequence: ${describeSequence(result)}`,
  ].join('\n');
}

export function buildReport(result) {
  const isSingle = result.flips.length === 1;
  return {
    inputs: [{ label: 'Number of flips', value: formatNumber(result.flips.length) }],
    results: isSingle
      ? [{ label: 'Result', value: result.flips[0] }]
      : [
          { label: 'Heads', value: formatNumber(result.heads) },
          { label: 'Tails', value: formatNumber(result.tails) },
        ],
    details: isSingle ? null : getDetails(result),
    text: isSingle ? null : { title: 'Every flip (H = heads, T = tails)', value: describeSequence(result) },
  };
}
