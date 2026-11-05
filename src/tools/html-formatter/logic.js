import beautifyHtml from 'js-beautify/js/src/html/index.js';
import { formatNumber } from '../../utils/formatResult.js';

export const INDENTS = [
  { id: 'two', name: '2 spaces', options: { indent_size: 2, indent_char: ' ' } },
  { id: 'four', name: '4 spaces', options: { indent_size: 4, indent_char: ' ' } },
  { id: 'tab', name: 'Tab', options: { indent_size: 1, indent_char: '\t' } },
];

const getIndent = (id) => INDENTS.find((indent) => indent.id === id);

export function formatHtml(text, indentId) {
  return beautifyHtml(text, { ...getIndent(indentId).options, wrap_line_length: 0, end_with_newline: false, extra_liners: [] });
}

export function evaluate(text, indentId) {
  if (!text.trim()) return { error: null, output: null };
  try {
    return { error: null, output: formatHtml(text, indentId) };
  } catch {
    return { error: 'This HTML could not be formatted.', output: null };
  }
}

export const buildReport = (output, indentId) => ({
  inputs: [{ label: 'Indent', value: getIndent(indentId).name }],
  results: [{ label: 'Lines', value: formatNumber(output.split('\n').length) }],
  text: { title: 'Formatted HTML', value: output, mono: true },
});
