import { formatNumber } from '../../utils/formatResult.js';
import { READING_WPM, SPEAKING_WPM, durationSeconds, excerpt, formatTextDuration, getTextStats } from '../../utils/textStats.js';

export function evaluate(text) {
  if (!text.trim()) return null;
  const stats = getTextStats(text);
  return {
    ...stats,
    readingTime: formatTextDuration(durationSeconds(stats.words, READING_WPM)),
    speakingTime: formatTextDuration(durationSeconds(stats.words, SPEAKING_WPM)),
  };
}

const details = (result) => [
  { label: 'Characters (no spaces)', value: formatNumber(result.charactersNoSpaces) },
  { label: 'Paragraphs', value: formatNumber(result.paragraphs) },
  { label: 'Reading Time', value: result.readingTime },
  { label: 'Speaking Time', value: result.speakingTime },
];

export const getDetails = details;

export const buildResultText = (result) =>
  [
    `Words: ${formatNumber(result.words)}`,
    `Characters: ${formatNumber(result.characters)}`,
    `Sentences: ${formatNumber(result.sentences)}`,
    ...details(result).map(({ label, value }) => `${label}: ${value}`),
  ].join('\n');

export const buildReport = (text, result) => ({
  results: [
    { label: 'Words', value: formatNumber(result.words) },
    { label: 'Characters', value: formatNumber(result.characters) },
    { label: 'Sentences', value: formatNumber(result.sentences) },
  ],
  details: details(result),
  text: { title: 'Text', value: excerpt(text) },
});
