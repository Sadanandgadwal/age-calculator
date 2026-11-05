import { formatNumber } from '../../utils/formatResult.js';
import { byteLength, describeSaving } from '../../utils/textStats.js';

export const TIMEOUT_MS = 20000;
export const TIMEOUT_MESSAGE = 'This code took too long to minify, so it was stopped. Please try a smaller file.';

export const measure = (code, output) => describeSaving(byteLength(code), byteLength(output));

export const bytes = (value) => `${formatNumber(value)} ${value === 1 ? 'byte' : 'bytes'}`;

const yesNo = (value) => (value ? 'Yes' : 'No');

export const buildReport = ({ output, before, after, percent, compress, mangle }) => ({
  inputs: [
    { label: 'Compress code', value: yesNo(compress) },
    { label: 'Shorten variable names', value: yesNo(mangle) },
  ],
  results: [
    { label: 'Saved', value: `${percent}%` },
    { label: 'Minified size', value: bytes(after) },
    { label: 'Original size', value: bytes(before) },
  ],
  text: { title: 'Minified JavaScript', value: output, mono: true },
});
