import { formatNumber } from './formatResult.js';

export const READING_WPM = 238;
export const SPEAKING_WPM = 150;

const NON_ASCII_RUN = /\p{ASCII}?\P{ASCII}+/gu;
const HAS_WORD_CHARACTER = /[\p{L}\p{N}]/u;
const SENTENCE_END = /[.!?।]+(?:\s+|$)/u;
const EXCERPT_LENGTH = 1000;

const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

export function splitGraphemes(text) {
  if (!segmenter) return [...text];
  return Array.from(segmenter.segment(text), ({ segment }) => segment);
}

export function countCharacters(text) {
  let count = text.length;
  for (const [run] of text.matchAll(NON_ASCII_RUN)) {
    count -= run.length;
    if (segmenter) for (const _ of segmenter.segment(run)) count += 1;
    else count += [...run].length;
  }
  return count;
}

export const getWords = (text) => text.split(/\s+/).filter((word) => HAS_WORD_CHARACTER.test(word));

export const getLines = (text) => (text === '' ? [] : text.split('\n'));

export function getTextStats(text) {
  const lines = getLines(text);
  const nonEmptyLines = lines.filter((line) => line.trim()).length;
  const characters = countCharacters(text);
  return {
    characters,
    charactersNoSpaces: characters - (text.match(/\s/g)?.length ?? 0),
    words: getWords(text).length,
    sentences: text.split(SENTENCE_END).filter((part) => HAS_WORD_CHARACTER.test(part)).length,
    paragraphs: text.split(/\n\s*\n/).filter((part) => part.trim()).length,
    lines: lines.length,
    nonEmptyLines,
    blankLines: lines.length - nonEmptyLines,
  };
}

export const durationSeconds = (words, wordsPerMinute) => Math.ceil((words / wordsPerMinute) * 60);

export function formatTextDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours && `${formatNumber(hours)} h`, minutes && `${minutes} min`, (rest || seconds === 0) && `${rest} sec`].filter(Boolean).join(' ');
}

export const excerpt = (text) => (text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text);
