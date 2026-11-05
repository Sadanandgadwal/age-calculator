import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';
import { durationSeconds, formatTextDuration, getWords } from '../../utils/textStats.js';

const MESSAGE = 'Please enter 1 to 1,000 words a minute.';
const speedField = (text) => checkNumber(text, { required: MESSAGE, min: 1, max: 1000, minMessage: MESSAGE, maxMessage: MESSAGE });

export function evaluate(text, readingSpeed, speakingSpeed) {
  const { errors, values, isValid } = collectFields({ reading: speedField(readingSpeed), speaking: speedField(speakingSpeed) });
  const words = getWords(text).length;
  if (!isValid || words === 0) return { errors, result: null };
  return {
    errors,
    result: {
      words,
      readingSpeed: values.reading,
      speakingSpeed: values.speaking,
      readingTime: formatTextDuration(durationSeconds(words, values.reading)),
      speakingTime: formatTextDuration(durationSeconds(words, values.speaking)),
    },
  };
}

export const buildResultText = (result) =>
  [
    `Words: ${formatNumber(result.words)}`,
    `Reading time: ${result.readingTime} at ${formatNumber(result.readingSpeed)} words a minute`,
    `Speaking time: ${result.speakingTime} at ${formatNumber(result.speakingSpeed)} words a minute`,
  ].join('\n');

export const buildReport = (result) => ({
  inputs: [
    { label: 'Words in the text', value: formatNumber(result.words) },
    { label: 'Reading speed', value: `${formatNumber(result.readingSpeed)} words a minute` },
    { label: 'Speaking speed', value: `${formatNumber(result.speakingSpeed)} words a minute` },
  ],
  results: [
    { label: 'Reading time', value: result.readingTime },
    { label: 'Speaking time', value: result.speakingTime },
  ],
});
