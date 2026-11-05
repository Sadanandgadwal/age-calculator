import { formatNumber } from '../../utils/formatResult.js';
import { formatDecimal } from '../../utils/number.js';
import { countCharacters, excerpt, getLines } from '../../utils/textStats.js';

export function evaluate(text) {
  if (!text) return null;
  const lines = getLines(text);
  const lengths = lines.map(countCharacters);
  const nonEmpty = lines.filter((line) => line.trim()).length;
  const longest = Math.max(...lengths.slice(0, 100000));
  return {
    lines: lines.length,
    nonEmpty,
    blank: lines.length - nonEmpty,
    longest,
    longestLine: lengths.indexOf(longest) + 1,
    average: lengths.reduce((sum, length) => sum + length, 0) / lines.length,
  };
}

export const getDetails = (result) => [
  { label: 'Longest Line', value: `Line ${formatNumber(result.longestLine)} (${formatNumber(result.longest)} characters)` },
  { label: 'Average Line Length', value: `${formatDecimal(result.average)} characters` },
];

export const buildResultText = (result) =>
  [
    `Total lines: ${formatNumber(result.lines)}`,
    `Non-empty lines: ${formatNumber(result.nonEmpty)}`,
    `Blank lines: ${formatNumber(result.blank)}`,
    ...getDetails(result).map(({ label, value }) => `${label}: ${value}`),
  ].join('\n');

export const buildReport = (text, result) => ({
  results: [
    { label: 'Total lines', value: formatNumber(result.lines) },
    { label: 'Non-empty lines', value: formatNumber(result.nonEmpty) },
    { label: 'Blank lines', value: formatNumber(result.blank) },
  ],
  details: getDetails(result),
  text: { title: 'Text', value: excerpt(text) },
});
