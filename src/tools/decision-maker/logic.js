import { formatNumber } from '../../utils/formatResult.js';
import { formatDecimal } from '../../utils/number.js';
import { randomBelow } from '../../utils/secureRandom.js';
import { excerpt, getLines } from '../../utils/textStats.js';

const MAX_WEIGHT = 1000;
const WEIGHTED = /^(.*\S)\s*\|\s*(\S+)$/;

export function readOptions(text) {
  const options = [];
  for (const [index, line] of getLines(text).entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(WEIGHTED);
    if (!match) {
      options.push({ name: trimmed, weight: 1 });
      continue;
    }
    const weight = Number(match[2]);
    if (!Number.isInteger(weight) || weight < 1 || weight > MAX_WEIGHT) {
      return { error: `Line ${index + 1}: the weight after | must be a whole number from 1 to ${formatNumber(MAX_WEIGHT)}.` };
    }
    options.push({ name: match[1], weight });
  }
  const merged = new Map();
  for (const { name, weight } of options) merged.set(name, (merged.get(name) ?? 0) + weight);
  if (merged.size < 2) return { error: 'Please enter at least two different options, one on each line.' };
  return { options: Array.from(merged, ([name, weight]) => ({ name, weight })) };
}

export function pickOption(options, pick = randomBelow) {
  const total = options.reduce((sum, { weight }) => sum + weight, 0);
  let position = pick(total);
  const winner = options.find(({ weight }) => {
    position -= weight;
    return position < 0;
  });
  return {
    winner: winner.name,
    total,
    options: options.map(({ name, weight }) => ({ name, weight, chance: (weight / total) * 100 })),
    winnerChance: (winner.weight / total) * 100,
  };
}

export const formatChance = (chance) => `${formatDecimal(chance)}%`;

export const buildResultText = ({ question, winner, winnerChance }) => [question && `Question: ${question}`, `Decision: ${winner}`, `Chance: ${formatChance(winnerChance)}`].filter(Boolean).join('\n');

export const buildReport = ({ question, winner, winnerChance, options }) => ({
  inputs: question ? [{ label: 'Question', value: excerpt(question) }] : null,
  results: [
    { label: 'Decision', value: winner },
    { label: 'Its chance', value: formatChance(winnerChance) },
  ],
  table: {
    caption: 'All options',
    columns: ['Option', 'Weight', 'Chance'],
    rows: options.map(({ name, weight, chance }) => [name, formatNumber(weight), formatChance(chance)]),
  },
});
