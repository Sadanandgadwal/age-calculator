import { formatNumber } from '../../utils/formatResult.js';
import { getLines } from '../../utils/textStats.js';

export function removeDuplicates(text, { ignoreCase = false, ignoreSpaces = false, removeBlank = false } = {}) {
  const seen = new Set();
  const lines = getLines(text);
  const kept = lines.filter((line) => {
    if (removeBlank && !line.trim()) return false;
    let key = ignoreSpaces ? line.trim().replace(/\s+/g, ' ') : line;
    if (ignoreCase) key = key.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { output: kept.join('\n'), total: lines.length, kept: kept.length, removed: lines.length - kept.length };
}

export const evaluate = (text, options) => (text.trim() ? removeDuplicates(text, options) : null);

const yesNo = (value) => (value ? 'Yes' : 'No');

export const buildReport = (result, { ignoreCase, ignoreSpaces, removeBlank }) => ({
  inputs: [
    { label: 'Ignore capital letters', value: yesNo(ignoreCase) },
    { label: 'Ignore extra spaces', value: yesNo(ignoreSpaces) },
    { label: 'Remove blank lines', value: yesNo(removeBlank) },
  ],
  results: [
    { label: 'Lines kept', value: formatNumber(result.kept) },
    { label: 'Lines removed', value: formatNumber(result.removed) },
    { label: 'Original lines', value: formatNumber(result.total) },
  ],
  text: { title: 'Cleaned list', value: result.output },
});
