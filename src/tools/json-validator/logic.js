import { formatNumber } from '../../utils/formatResult.js';
import { getTreeStats, parseJson } from '../../utils/jsonTools.js';

export function evaluate(text) {
  if (!text.trim()) return null;
  const { tree, error } = parseJson(text);
  if (error) return { valid: false, message: error.message, detail: error.detail ?? null };
  return { valid: true, stats: getTreeStats(tree) };
}

export const getDetails = ({ stats }) => [
  { label: 'Keys', value: formatNumber(stats.keys) },
  { label: 'Strings', value: formatNumber(stats.strings) },
  { label: 'Numbers', value: formatNumber(stats.numbers) },
  { label: 'True or False Values', value: formatNumber(stats.booleans) },
  { label: 'Null Values', value: formatNumber(stats.nulls) },
  { label: 'Deepest Level', value: formatNumber(stats.depth) },
];

export const duplicateNote = ({ stats }) =>
  stats.duplicateKeys > 0 ? `Valid, but ${formatNumber(stats.duplicateKeys)} ${stats.duplicateKeys === 1 ? 'key is' : 'keys are'} repeated in the same object. Most programs keep only the last value.` : null;

export function buildResultText(result) {
  if (!result.valid) return [`Invalid JSON. ${result.message}`, result.detail].filter(Boolean).join('\n');
  return [
    'Valid JSON',
    `Objects: ${formatNumber(result.stats.objects)}`,
    `Arrays: ${formatNumber(result.stats.arrays)}`,
    ...getDetails(result).map(({ label, value }) => `${label}: ${value}`),
    duplicateNote(result),
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildReport(result) {
  if (!result.valid) {
    return {
      results: [{ label: 'Result', value: 'Invalid JSON' }],
      notes: [result.message, result.detail].filter(Boolean),
    };
  }
  const note = duplicateNote(result);
  return {
    results: [
      { label: 'Result', value: 'Valid JSON' },
      { label: 'Objects', value: formatNumber(result.stats.objects) },
      { label: 'Arrays', value: formatNumber(result.stats.arrays) },
    ],
    details: getDetails(result),
    notes: note ? [note] : null,
  };
}
