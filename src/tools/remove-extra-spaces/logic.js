import { formatNumber } from '../../utils/formatResult.js';
import { countCharacters } from '../../utils/textStats.js';

const trimBlankEnds = (lines) => {
  const start = lines.findIndex((line) => line.trim());
  if (start === -1) return [];
  const end = lines.findLastIndex((line) => line.trim());
  return lines.slice(start, end + 1);
};

export function cleanSpaces(text, { trimLines = true, removeBlank = false } = {}) {
  const collapsed = text.split('\n').map((line) => {
    const single = line.replace(/[^\S\n]+/g, ' ');
    return trimLines ? single.trim() : single;
  });

  const cleaned = removeBlank
    ? collapsed.filter((line) => line.trim())
    : collapsed.filter((line, index) => line.trim() || (index > 0 && collapsed[index - 1].trim()));

  return (trimLines ? trimBlankEnds(cleaned) : cleaned).join('\n');
}

export function evaluate(text, options) {
  if (!text) return null;
  const output = cleanSpaces(text, options);
  return { output, removed: countCharacters(text) - countCharacters(output), characters: countCharacters(output) };
}

const yesNo = (value) => (value ? 'Yes' : 'No');

export const buildReport = (result, { trimLines, removeBlank }) => ({
  inputs: [
    { label: 'Trim the start and end of lines', value: yesNo(trimLines) },
    { label: 'Remove all blank lines', value: yesNo(removeBlank) },
  ],
  results: [
    { label: 'Characters removed', value: formatNumber(result.removed) },
    { label: 'Characters left', value: formatNumber(result.characters) },
  ],
  text: { title: 'Cleaned text', value: result.output },
});
