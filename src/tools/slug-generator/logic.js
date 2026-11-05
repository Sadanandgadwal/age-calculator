import { formatNumber } from '../../utils/formatResult.js';
import { excerpt } from '../../utils/textStats.js';

export const SEPARATORS = [
  { id: '-', name: 'Hyphen (-)' },
  { id: '_', name: 'Underscore (_)' },
];

const LATIN_LETTERS = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', đ: 'd', ð: 'd', ł: 'l', þ: 'th', ı: 'i' };
const LATIN_LETTER_PATTERN = new RegExp(`[${Object.keys(LATIN_LETTERS).join('')}]`, 'g');

export function slugify(text, separator = '-', keepCase = false) {
  const prepared = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ');
  const cased = keepCase ? prepared : prepared.toLowerCase();
  const simplified = cased.replace(LATIN_LETTER_PATTERN, (letter) => LATIN_LETTERS[letter]);
  return (simplified.match(/[\p{L}\p{N}\p{M}]+/gu) ?? []).join(separator);
}

export const evaluate = (text, separator, keepCase) => {
  if (!text.trim()) return null;
  return { slug: slugify(text, separator, keepCase) };
};

export const buildReport = (text, separator, keepCase, slug) => ({
  inputs: [
    { label: 'Title', value: excerpt(text.trim()) },
    { label: 'Separator', value: SEPARATORS.find(({ id }) => id === separator).name },
    { label: 'Keep capital letters', value: keepCase ? 'Yes' : 'No' },
  ],
  results: [{ label: 'Length in characters', value: formatNumber(slug.length) }],
  text: { title: 'Slug', value: slug },
});
