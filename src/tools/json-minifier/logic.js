import { formatNumber } from '../../utils/formatResult.js';
import { parseJson, printTree } from '../../utils/jsonTools.js';
import { byteLength, describeSaving } from '../../utils/textStats.js';

export function evaluate(text) {
  if (!text.trim()) return { error: null, result: null };
  const { tree, error } = parseJson(text);
  if (error) return { error: error.message, result: null };
  const output = printTree(tree);
  return { error: null, result: { output, ...describeSaving(byteLength(text), byteLength(output)) } };
}

export const bytes = (value) => `${formatNumber(value)} ${value === 1 ? 'byte' : 'bytes'}`;

export const buildReport = ({ output, before, after, saved, percent }) => ({
  results: [
    { label: 'Saved', value: `${percent}%` },
    { label: 'Minified size', value: bytes(after) },
    { label: 'Original size', value: bytes(before) },
  ],
  details: [{ label: 'Bytes removed', value: bytes(saved) }],
  text: { title: 'Minified JSON', value: output, mono: true },
});
