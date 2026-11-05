import { decodeBase64, encodeBase64 } from '../../utils/base64.js';
import { byteLength } from '../../utils/textStats.js';
import { formatNumber } from '../../utils/formatResult.js';

export const MODES = [
  { id: 'encode', name: 'Encode' },
  { id: 'decode', name: 'Decode' },
];

export function evaluate(modeId, text, urlSafe) {
  if (!text) return { error: null, output: null };
  if (modeId === 'encode') return { error: null, output: encodeBase64(text, urlSafe) };
  const { error, output } = decodeBase64(text);
  return { error: error ?? null, output: output ?? null };
}

export const buildReport = (modeId, urlSafe, output) => ({
  inputs: [
    { label: 'Action', value: MODES.find(({ id }) => id === modeId).name },
    ...(modeId === 'encode' ? [{ label: 'URL-safe', value: urlSafe ? 'Yes' : 'No' }] : []),
  ],
  results: [{ label: 'Bytes in the result', value: formatNumber(byteLength(output)) }],
  text: { title: modeId === 'encode' ? 'Base64' : 'Decoded text', value: output, mono: true },
});
