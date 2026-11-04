import { formatNumber } from './formatResult.js';

export const READING_WPM = 238;
export const SPEAKING_WPM = 150;

const ASCII_ONLY = /^[\x20-\x7e\n\t]*$/;
const HAS_WORD_CHARACTER = /[\p{L}\p{N}]/u;
const SENTENCE_END = /[.!?।]+(?:\s+|$)/u;
const EXCERPT_LENGTH = 1000;

export function splitGraphemes(text) {
  if (typeof Intl.Segmenter !== 'function') return [...text];
  return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), ({ segment }) => segment);
}

export const countCharacters = (text) => (ASCII_ONLY.test(text) ? text.length : splitGraphemes(text).length);

export const getWords = (text) => text.split(/\s+/).filter((word) => HAS_WORD_CHARACTER.test(word));

export const getLines = (text) => (text === '' ? [] : text.split('\n'));

export function getTextStats(text) {
  const lines = getLines(text);
  const nonEmptyLines = lines.filter((line) => line.trim()).length;
  return {
    characters: countCharacters(text),
    charactersNoSpaces: countCharacters(text.replace(/\s/g, '')),
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
