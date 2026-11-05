import { formatNumber } from '../../utils/formatResult.js';
import { countCharacters, getLines } from '../../utils/textStats.js';

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
const leadingNumber = (line) => Number.parseFloat(line.trim().replace(/,/g, ''));

function byNumber(a, b) {
  const [first, second] = [leadingNumber(a), leadingNumber(b)];
  if (Number.isNaN(first) && Number.isNaN(second)) return collator.compare(a, b);
  if (Number.isNaN(first)) return 1;
  if (Number.isNaN(second)) return -1;
  return first - second;
}

export const MODES = [
  { id: 'az', name: 'A to Z', compare: (a, b) => collator.compare(a, b) },
  { id: 'za', name: 'Z to A', compare: (a, b) => collator.compare(b, a) },
  { id: 'number', name: 'By number', compare: byNumber },
  { id: 'length', name: 'By length', compare: (a, b) => countCharacters(a) - countCharacters(b) || collator.compare(a, b) },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export const readLines = (text, removeBlank) => {
  const lines = getLines(text);
  return removeBlank ? lines.filter((line) => line.trim()) : lines;
};

export const sortLines = (lines, modeId) => [...lines].sort(getMode(modeId).compare);

export const buildReport = (order, output) => ({
  inputs: [{ label: 'Order', value: order }],
  results: [{ label: 'Lines', value: formatNumber(output.length) }],
  text: { title: 'Sorted lines', value: output.join('\n') },
});
