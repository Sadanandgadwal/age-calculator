import { formatNumber } from '../../utils/formatResult.js';
import { getLines, getWords, splitGraphemes } from '../../utils/textStats.js';

export const MODES = [
  { id: 'characters', name: 'Characters', convert: (text) => splitGraphemes(text).reverse().join('') },
  {
    id: 'words',
    name: 'Words',
    convert: (text) =>
      text
        .split('\n')
        .map((line) => line.split(/(\s+)/).reverse().join(''))
        .join('\n'),
  },
  { id: 'lines', name: 'Lines', convert: (text) => text.split('\n').reverse().join('\n') },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export const evaluate = (modeId, text) => (text ? getMode(modeId).convert(text) : null);

export const buildReport = (modeId, text, output) => ({
  inputs: [{ label: 'Reversed by', value: getMode(modeId).name }],
  results: [
    { label: 'Words', value: formatNumber(getWords(text).length) },
    { label: 'Lines', value: formatNumber(getLines(text).length) },
  ],
  text: { title: 'Reversed text', value: output },
});
