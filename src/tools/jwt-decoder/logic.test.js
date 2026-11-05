import { describe, expect, it } from 'vitest';
import { buildResultText, decodeJwt } from './logic.js';
import { encodeBase64 } from '../../utils/base64.js';

const part = (value) => encodeBase64(JSON.stringify(value), true);
const token = (payload, header = { alg: 'HS256', typ: 'JWT' }) => `${part(header)}.${part(payload)}.signature`;
const NOW = 1700000000000;

describe('decodeJwt', () => {
  it('reads the published example token', () => {
    const { result } = decodeJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', NOW);
    expect(result.algorithm).toBe('HS256');
    expect(result.payload).toContain('"name": "John Doe"');
    expect(result.times).toEqual([{ id: 'iat', label: 'Issued At', value: 'Thu, 18 Jan 2018 01:30:22 GMT' }]);
    expect(result.status).toBe('No expiry set');
  });

  it('accepts a Bearer prefix and spaces', () => {
    expect(decodeJwt(` Bearer ${token({ a: 1 })} `, NOW).result).toBeTruthy();
  });

  it('reads non-English text', () => {
    expect(decodeJwt(token({ name: 'नमस्ते' }), NOW).result.payload).toContain('नमस्ते');
  });

  it.each([
    [{ exp: 1 }, 'Expired'],
    [{ exp: NOW / 1000 }, 'Expired'],
    [{ exp: NOW / 1000 + 60 }, 'Not expired'],
    [{ nbf: NOW / 1000 + 60, exp: NOW / 1000 + 120 }, 'Not yet valid'],
    [{}, 'No expiry set'],
    [{ exp: 'soon' }, 'No expiry set'],
    [{ exp: 1e20 }, 'No expiry set'],
  ])('rates %j', (payload, status) => {
    expect(decodeJwt(token(payload), NOW).result.status).toBe(status);
  });

  it('warns about unsigned tokens', () => {
    expect(decodeJwt(token({}, { alg: 'none' }), NOW).result.isUnsigned).toBe(true);
    expect(decodeJwt(token({}, { alg: 'NONE' }), NOW).result.isUnsigned).toBe(true);
    expect(decodeJwt(token({}), NOW).result.isUnsigned).toBe(false);
  });

  it.each([
    ['abc', 'three parts'],
    ['a.b', 'three parts'],
    ['a.b.c.d', 'three parts'],
    ['***.e30.x', 'header is not valid Base64'],
    ['e30.***.x', 'payload is not valid Base64'],
    [`${part([1])}.e30.x`, 'header is not a JSON object'],
    ['e30.bm90IGpzb24.x', 'payload is not a JSON object'],
  ])('explains %j', (input, message) => {
    expect(decodeJwt(input, NOW).error).toContain(message);
  });

  it('has nothing for blank text', () => {
    expect(decodeJwt('   ', NOW)).toEqual({ error: null, result: null });
  });
});

describe('buildResultText', () => {
  it('always says the token is not verified', () => {
    expect(buildResultText(decodeJwt(token({ a: 1 }), NOW).result)).toContain('has not been verified');
  });
});
