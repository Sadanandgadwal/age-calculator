import { formatNumber } from '../../utils/formatResult.js';
import { excerpt } from '../../utils/textStats.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function validate({ text, find }) {
  const errors = {};
  if (!text) errors.text = 'Please enter your text.';
  if (!find) errors.find = 'Please enter what to find.';
  return errors;
}

function buildPattern({ find, caseSensitive, wholeWord, useRegex }) {
  const caseFlag = caseSensitive ? '' : 'i';
  if (useRegex) return new RegExp(wholeWord ? `\\b(?:${find})\\b` : find, `gm${caseFlag}`);
  const literal = escapeRegex(find);
  return new RegExp(wholeWord ? `(?<![\\p{L}\\p{N}_])${literal}(?![\\p{L}\\p{N}_])` : literal, `gu${caseFlag}`);
}

export function replaceText({ text, find, replacement = '', caseSensitive = false, wholeWord = false, useRegex = false }) {
  let pattern;
  try {
    pattern = buildPattern({ find, caseSensitive, wholeWord, useRegex });
  } catch (error) {
    return { error: `This is not a valid pattern: ${error.message}` };
  }

  if (useRegex) return { output: text.replace(pattern, replacement), count: [...text.matchAll(pattern)].length };

  let count = 0;
  const output = text.replace(pattern, () => {
    count += 1;
    return replacement;
  });
  return { output, count };
}

export const buildResultText = ({ output }) => output;

const yesNo = (value) => (value ? 'Yes' : 'No');

export const buildReport = (result, { find, replacement, caseSensitive, wholeWord, useRegex }) => ({
  inputs: [
    { label: 'Find', value: excerpt(find) },
    { label: 'Replace with', value: replacement ? excerpt(replacement) : '(nothing)' },
    { label: 'Match case', value: yesNo(caseSensitive) },
    { label: 'Whole words only', value: yesNo(wholeWord) },
    { label: 'Regular expression', value: yesNo(useRegex) },
  ],
  results: [{ label: result.count === 1 ? 'Replacement made' : 'Replacements made', value: formatNumber(result.count) }],
  text: { title: 'Updated text', value: result.output },
});
