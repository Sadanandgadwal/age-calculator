import { formatNumber } from '../../utils/formatResult.js';
import { excerpt } from '../../utils/textStats.js';

export const MAX_MATCHES = 1000;
const MAX_PRINTED = 200;

export const FLAGS = [
  { id: 'g', label: 'Find all matches (g)' },
  { id: 'i', label: 'Ignore capital letters (i)' },
  { id: 'm', label: 'Multiline: ^ and $ match each line (m)' },
  { id: 's', label: 'Dot matches line breaks (s)' },
  { id: 'u', label: 'Unicode (u)' },
];

const toMatch = (match) => ({
  index: match.index,
  text: match[0],
  groups: match.slice(1).map((group) => group ?? null),
  named: match.groups ? { ...match.groups } : null,
});

export function runRegex({ pattern, flags, text }) {
  let expression;
  try {
    expression = new RegExp(pattern, flags);
  } catch (error) {
    return { error: `This is not a valid pattern: ${error.message}` };
  }

  const matches = [];
  let truncated = false;
  if (expression.global) {
    for (const match of text.matchAll(expression)) {
      if (matches.length === MAX_MATCHES) {
        truncated = true;
        break;
      }
      matches.push(toMatch(match));
    }
  } else {
    const match = expression.exec(text);
    if (match) matches.push(toMatch(match));
  }
  return { matches, truncated };
}

export function buildSegments(text, matches) {
  const segments = [];
  let position = 0;
  for (const { index, text: matched } of matches) {
    if (matched === '') continue;
    if (index > position) segments.push({ text: text.slice(position, index), isMatch: false });
    segments.push({ text: matched, isMatch: true });
    position = index + matched.length;
  }
  if (position < text.length) segments.push({ text: text.slice(position), isMatch: false });
  return segments;
}

export const describeGroups = ({ groups, named }) => {
  if (named) return Object.entries(named).map(([name, value]) => `${name}: ${value ?? '(none)'}`).join(', ');
  return groups.map((group, index) => `${index + 1}: ${group ?? '(none)'}`).join(', ');
};

const countLabel = ({ matches, truncated }) => `${formatNumber(matches.length)}${truncated ? '+' : ''}`;
export const getCountLabel = countLabel;

const describeMatch = (match, index) => `${index + 1}. "${match.text}" at position ${match.index}${match.groups.length ? ` (groups ${describeGroups(match)})` : ''}`;

export const buildResultText = (result) => [`Matches: ${countLabel(result)}`, ...result.matches.map(describeMatch)].join('\n');

export const buildReport = ({ pattern, flags, text }, result) => ({
  inputs: [
    { label: 'Pattern', value: excerpt(pattern) },
    { label: 'Flags', value: flags || 'None' },
  ],
  results: [{ label: result.matches.length === 1 ? 'Match' : 'Matches', value: countLabel(result) }],
  table:
    result.matches.length > 0
      ? {
          caption: 'Matches',
          columns: ['#', 'Position', 'Match', 'Groups'],
          rows: result.matches.slice(0, MAX_PRINTED).map((match, index) => [index + 1, match.index, excerpt(match.text), describeGroups(match) || '—']),
        }
      : null,
  text: { title: 'Test text', value: excerpt(text), mono: true },
  notes: result.matches.length > MAX_PRINTED ? [`Showing the first ${MAX_PRINTED} matches.`] : null,
});
