import { checkNumber } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { excerpt, getTextStats, splitGraphemes } from '../../utils/textStats.js';

const LETTER = /\p{L}/u;
const DIGIT = /\p{N}/u;
const SPACE = /^\s+$/u;

export function countKinds(text) {
  const counts = { letters: 0, digits: 0, spaces: 0, symbols: 0 };
  for (const character of splitGraphemes(text)) {
    if (LETTER.test(character)) counts.letters += 1;
    else if (DIGIT.test(character)) counts.digits += 1;
    else if (SPACE.test(character)) counts.spaces += 1;
    else counts.symbols += 1;
  }
  return counts;
}

export function evaluate(text, limitText) {
  const trimmedLimit = String(limitText ?? '').trim();
  const limitField = trimmedLimit
    ? checkNumber(trimmedLimit, { min: 1, max: 1000000000, whole: true, minMessage: 'Please enter a limit of 1 or more.', maxMessage: 'Please enter a smaller limit.' })
    : {};
  const errors = limitField.error ? { limit: limitField.error } : {};
  if (!text) return { errors, result: null };

  const { characters, charactersNoSpaces, words } = getTextStats(text);
  const limit = limitField.value ?? null;
  return {
    errors,
    result: { characters, charactersNoSpaces, words, ...countKinds(text), limit, remaining: limit === null ? null : limit - characters },
  };
}

export function describeLimit({ limit, remaining }) {
  if (limit === null) return null;
  if (remaining < 0) return `${formatNumber(-remaining)} over the limit of ${formatNumber(limit)}`;
  return `${formatNumber(remaining)} left of ${formatNumber(limit)}`;
}

export const getDetails = (result) => [
  { label: 'Letters', value: formatNumber(result.letters) },
  { label: 'Digits', value: formatNumber(result.digits) },
  { label: 'Spaces and Line Breaks', value: formatNumber(result.spaces) },
  { label: 'Symbols and Emoji', value: formatNumber(result.symbols) },
];

export const buildResultText = (result) =>
  [
    `Characters: ${formatNumber(result.characters)}`,
    `Without spaces: ${formatNumber(result.charactersNoSpaces)}`,
    `Words: ${formatNumber(result.words)}`,
    describeLimit(result),
    ...getDetails(result).map(({ label, value }) => `${label}: ${value}`),
  ]
    .filter(Boolean)
    .join('\n');

export function buildReport(text, result) {
  const limit = describeLimit(result);
  return {
    inputs: result.limit === null ? null : [{ label: 'Character limit', value: formatNumber(result.limit) }],
    results: [
      { label: 'Characters', value: formatNumber(result.characters) },
      { label: 'Without spaces', value: formatNumber(result.charactersNoSpaces) },
      { label: 'Words', value: formatNumber(result.words) },
    ],
    details: getDetails(result),
    text: { title: 'Text', value: excerpt(text) },
    notes: limit ? [limit] : null,
  };
}
