import { checkNumber } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { getTextStats } from '../../utils/textStats.js';

export const UNITS = [
  { id: 'paragraphs', name: 'Paragraphs', max: 100 },
  { id: 'sentences', name: 'Sentences', max: 500 },
  { id: 'words', name: 'Words', max: 5000 },
];

const OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
const WORDS = 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function createPicker() {
  let state = 7;
  return (limit) => {
    state = (state * 48271) % 2147483647;
    return state % limit;
  };
}

const pickWords = (pick, count) => Array.from({ length: count }, () => WORDS[pick(WORDS.length)]);
const toSentence = (words) => `${words[0][0].toUpperCase()}${words[0].slice(1)}${words.length > 1 ? ' ' : ''}${words.slice(1).join(' ')}.`;
const makeSentence = (pick) => toSentence(pickWords(pick, 8 + pick(9)));

function makeSentences(pick, count, classic) {
  const sentences = Array.from({ length: count }, () => makeSentence(pick));
  if (classic && count > 0) sentences[0] = `${OPENING}.`;
  return sentences;
}

export function generateLorem({ unit, count, classic }) {
  const pick = createPicker();
  if (unit === 'words') {
    const opening = classic ? OPENING.replace(',', '').toLowerCase().split(' ').slice(0, count) : [];
    const words = [...opening, ...pickWords(pick, count - opening.length)];
    return toSentence(words);
  }
  if (unit === 'sentences') return makeSentences(pick, count, classic).join(' ');
  return Array.from({ length: count }, (_, index) => makeSentences(pick, 4 + pick(4), classic && index === 0).join(' ')).join('\n\n');
}

export function evaluate({ unitId, countText, classic }) {
  const unit = UNITS.find(({ id }) => id === unitId);
  const message = `Please enter 1 to ${formatNumber(unit.max)}.`;
  const { value, error } = checkNumber(countText, { required: message, min: 1, max: unit.max, whole: true, minMessage: message, maxMessage: message });
  if (error) return { errors: { count: error }, result: null };

  const output = generateLorem({ unit: unitId, count: value, classic });
  const { words, characters } = getTextStats(output);
  return { errors: {}, result: { output, words, characters, count: value, unitName: unit.name, classic } };
}

export const buildReport = ({ output, words, characters, count, unitName, classic }) => ({
  inputs: [
    { label: unitName, value: formatNumber(count) },
    { label: 'Start with “Lorem ipsum”', value: classic ? 'Yes' : 'No' },
  ],
  results: [
    { label: 'Words', value: formatNumber(words) },
    { label: 'Characters', value: formatNumber(characters) },
  ],
  text: { title: 'Placeholder text', value: output },
});
