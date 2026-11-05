import { checkNumber } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { formatDecimal } from '../../utils/number.js';
import { randomBelow } from '../../utils/secureRandom.js';

const MAX_DICE = 100;
const MESSAGE = `Please enter 1 to ${MAX_DICE} dice.`;

export const DICE = [4, 6, 8, 10, 12, 20, 100].map((sides) => ({ id: String(sides), name: `d${sides}`, sides }));

export const validate = (text) => checkNumber(text, { required: MESSAGE, min: 1, max: MAX_DICE, whole: true, minMessage: MESSAGE, maxMessage: MESSAGE });

export function summarise(rolls, sides) {
  return {
    rolls,
    sides,
    total: rolls.reduce((sum, roll) => sum + roll, 0),
    highest: Math.max(...rolls),
    lowest: Math.min(...rolls),
  };
}

export const rollDice = (count, sides, pick = randomBelow) => summarise(Array.from({ length: count }, () => pick(sides) + 1), sides);

export const describeRolls = ({ rolls }) => rolls.join(', ');

const notation = ({ rolls, sides }) => `${rolls.length}d${sides}`;

export const getDetails = (result) => [
  { label: 'Highest Roll', value: formatNumber(result.highest) },
  { label: 'Lowest Roll', value: formatNumber(result.lowest) },
  { label: 'Average Roll', value: formatDecimal(result.total / result.rolls.length) },
];

export const buildResultText = (result) => `${notation(result)}: ${describeRolls(result)}\nTotal: ${formatNumber(result.total)}`;

export const buildReport = (result) => ({
  inputs: [
    { label: 'Dice', value: notation(result) },
  ],
  results: [{ label: 'Total', value: formatNumber(result.total) }],
  details: getDetails(result),
  text: { title: 'Every roll', value: describeRolls(result) },
});
