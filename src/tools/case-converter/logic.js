import { formatNumber } from '../../utils/formatResult.js';
import { countCharacters } from '../../utils/textStats.js';

const capitalize = (word) => {
  const [first = '', ...rest] = word;
  return first.toUpperCase() + rest.join('');
};

function codeWords(line) {
  const separated = line.replace(/['’]/g, '').replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2');
  return (separated.match(/[\p{L}\p{N}\p{M}]+/gu) ?? []).map((word) => word.toLowerCase());
}

const perLine = (convert) => (text) => text.split('\n').map(convert).join('\n');

export const MODES = [
  { id: 'upper', name: 'UPPER CASE', convert: (text) => text.toUpperCase() },
  { id: 'lower', name: 'lower case', convert: (text) => text.toLowerCase() },
  {
    id: 'title',
    name: 'Title Case',
    convert: (text) => text.toLowerCase().replace(/(^|[\s\-"“(])(\p{L})/gu, (_, before, letter) => before + letter.toUpperCase()),
  },
  {
    id: 'sentence',
    name: 'Sentence case',
    convert: (text) => text.toLowerCase().replace(/(^\s*|[.!?।]\s+|\n\s*)(\p{L})/gu, (_, before, letter) => before + letter.toUpperCase()),
  },
  {
    id: 'camel',
    name: 'camelCase',
    convert: perLine((line) => codeWords(line).map((word, index) => (index === 0 ? word : capitalize(word))).join('')),
  },
  { id: 'snake', name: 'snake_case', convert: perLine((line) => codeWords(line).join('_')) },
  { id: 'kebab', name: 'kebab-case', convert: perLine((line) => codeWords(line).join('-')) },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export const evaluate = (modeId, text) => (text.trim() ? getMode(modeId).convert(text) : null);

export const buildReport = (modeId, output) => ({
  inputs: [{ label: 'Converted to', value: getMode(modeId).name }],
  results: [{ label: 'Characters in the result', value: formatNumber(countCharacters(output)) }],
  text: { title: 'Converted text', value: output },
});
