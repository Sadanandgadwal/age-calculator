import SparkMD5 from 'spark-md5';

export const LEGACY_NOTE = 'MD5 and SHA-1 can be forged, so use them only for compatibility with older systems. Use SHA-256 or stronger for security.';

const ALGORITHMS = [
  { label: 'MD5 (not secure)', name: 'MD5' },
  { label: 'SHA-1 (not secure)', name: 'SHA-1' },
  { label: 'SHA-256', name: 'SHA-256' },
  { label: 'SHA-384', name: 'SHA-384' },
  { label: 'SHA-512', name: 'SHA-512' },
];

const toHex = (buffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');

export async function computeHashes(text) {
  const bytes = new TextEncoder().encode(text);
  if (!globalThis.crypto?.subtle) throw new Error('unavailable');
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return Promise.all(
    ALGORITHMS.map(async ({ label, name }) => ({
      label,
      value: name === 'MD5' ? SparkMD5.ArrayBuffer.hash(data) : toHex(await crypto.subtle.digest(name, data)),
    })),
  );
}

export const applyCase = (hashes, uppercase) => hashes.map((hash) => ({ ...hash, value: uppercase ? hash.value.toUpperCase() : hash.value }));

export const buildResultText = (hashes) => hashes.map(({ label, value }) => `${label}: ${value}`).join('\n');

export const buildReport = (text, hashes) => ({
  inputs: [{ label: 'Text length', value: `${text.length.toLocaleString('en-GB')} characters` }],
  results: [{ label: 'SHA-256', value: hashes.find(({ label }) => label === 'SHA-256').value }],
  details: hashes.filter(({ label }) => label !== 'SHA-256'),
  notes: [LEGACY_NOTE],
});
