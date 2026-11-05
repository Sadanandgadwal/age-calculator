import { decodeBase64 } from '../../utils/base64.js';
import { parseJson, printTree } from '../../utils/jsonTools.js';

const TIME_CLAIMS = [
  { id: 'iat', label: 'Issued At' },
  { id: 'nbf', label: 'Not Valid Before' },
  { id: 'exp', label: 'Expires' },
];
const MAX_DATE_SECONDS = 8640000000000;

export const NOT_VERIFIED = 'Decoded only. The signature has not been verified, so do not trust the contents of this token based on this page.';
export const UNSIGNED_WARNING = 'This token says it has no signature (alg: none), so anyone could have written it.';

function decodePart(part, name) {
  const { output, error } = decodeBase64(part);
  if (error) return { error: `The ${name} is not valid Base64.` };
  const { tree } = parseJson(output);
  if (!tree || tree.type !== 'object') return { error: `The ${name} is not a JSON object.` };
  return { text: printTree(tree, { indent: '  ' }), value: JSON.parse(output) };
}

const isTime = (value) => Number.isFinite(value) && Math.abs(value) <= MAX_DATE_SECONDS;

export function decodeJwt(input, now = Date.now()) {
  const token = input.trim().replace(/^Bearer\s+/i, '');
  if (!token) return { error: null, result: null };

  const parts = token.split('.');
  if (parts.length !== 3) return { error: 'A JWT has three parts separated by dots. This one has a different number.', result: null };

  const header = decodePart(parts[0], 'header');
  if (header.error) return { error: header.error, result: null };
  const payload = decodePart(parts[1], 'payload');
  if (payload.error) return { error: payload.error, result: null };

  const times = TIME_CLAIMS.filter(({ id }) => isTime(payload.value[id])).map(({ id, label }) => ({ id, label, value: new Date(payload.value[id] * 1000).toUTCString() }));

  let status = 'No expiry set';
  const { exp, nbf } = payload.value;
  if (isTime(exp) && exp * 1000 <= now) status = 'Expired';
  else if (isTime(nbf) && nbf * 1000 > now) status = 'Not yet valid';
  else if (isTime(exp)) status = 'Not expired';

  return {
    error: null,
    result: {
      header: header.text,
      payload: payload.text,
      algorithm: String(header.value.alg ?? 'Not stated'),
      isUnsigned: String(header.value.alg).toLowerCase() === 'none',
      status,
      times,
    },
  };
}

export const buildResultText = ({ header, payload }) => `Header:\n${header}\n\nPayload:\n${payload}\n\n${NOT_VERIFIED}`;
