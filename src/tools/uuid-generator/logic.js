import { checkNumber } from '../../utils/fieldValidation.js';
import { formatNumber } from '../../utils/formatResult.js';

export const VERSIONS = [
  { id: 'v4', name: 'Version 4 (random)' },
  { id: 'v7', name: 'Version 7 (time-ordered)' },
];

const MAX_COUNT = 1000;
const MESSAGE = `Please enter 1 to ${formatNumber(MAX_COUNT)}.`;

const toHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

function formatUuid(bytes) {
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createUuid(version, now = Date.now()) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  if (version === 'v7') {
    const high = Math.floor(now / 2 ** 16);
    bytes[0] = (high / 2 ** 24) & 0xff;
    bytes[1] = (high / 2 ** 16) & 0xff;
    bytes[2] = (high / 2 ** 8) & 0xff;
    bytes[3] = high & 0xff;
    bytes[4] = (now / 2 ** 8) & 0xff;
    bytes[5] = now & 0xff;
  }
  bytes[6] = (bytes[6] & 0x0f) | (version === 'v7' ? 0x70 : 0x40);
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUuid(bytes);
}

export function validate(countText) {
  const { value, error } = checkNumber(countText, { required: MESSAGE, min: 1, max: MAX_COUNT, whole: true, minMessage: MESSAGE, maxMessage: MESSAGE });
  return error ? { error } : { count: value };
}

export function generateUuids({ version, count, uppercase, noHyphens }) {
  return Array.from({ length: count }, () => {
    const uuid = createUuid(version);
    const shaped = noHyphens ? uuid.replace(/-/g, '') : uuid;
    return uppercase ? shaped.toUpperCase() : shaped;
  });
}

export const buildReport = ({ uuids, version, uppercase, noHyphens }) => ({
  inputs: [
    { label: 'Version', value: VERSIONS.find(({ id }) => id === version).name },
    { label: 'Uppercase', value: uppercase ? 'Yes' : 'No' },
    { label: 'Hyphens', value: noHyphens ? 'No' : 'Yes' },
  ],
  results: [{ label: uuids.length === 1 ? 'UUID created' : 'UUIDs created', value: formatNumber(uuids.length) }],
  text: { title: uuids.length === 1 ? 'UUID' : 'UUIDs', value: uuids.join('\n'), mono: true },
});
