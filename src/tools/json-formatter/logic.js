import { formatNumber } from '../../utils/formatResult.js';
import { parseJson, printTree } from '../../utils/jsonTools.js';

export const INDENTS = [
  { id: 'two', name: '2 spaces', value: '  ' },
  { id: 'four', name: '4 spaces', value: '    ' },
  { id: 'tab', name: 'Tab', value: '\t' },
];

export function evaluate(text, indentId, sortKeys) {
  if (!text.trim()) return { error: null, output: null };
  const { tree, error } = parseJson(text);
  if (error) return { error: error.message, output: null };
  return { error: null, output: printTree(tree, { indent: INDENTS.find(({ id }) => id === indentId).value, sortKeys }) };
}

export const buildReport = (output, indentId, sortKeys) => ({
  inputs: [
    { label: 'Indent', value: INDENTS.find(({ id }) => id === indentId).name },
    { label: 'Sort keys', value: sortKeys ? 'Yes' : 'No' },
  ],
  results: [{ label: 'Lines', value: formatNumber(output.split('\n').length) }],
  text: { title: 'Formatted JSON', value: output, mono: true },
});
