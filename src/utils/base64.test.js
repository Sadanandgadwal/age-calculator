import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64.js';

describe('encodeBase64', () => {
  it.each([
    ['', ''],
    ['Hello', 'SGVsbG8='],
    ['नमस्ते', '4KSo4KSu4KS44KWN4KSk4KWH'],
    ['😀', '8J+YgA=='],
  ])('encodes %j', (text, expected) => {
    expect(encodeBase64(text)).toBe(expected);
  });

  it('has a URL-safe form with no padding', () => {
    expect(encodeBase64('😀', true)).toBe('8J-YgA');
    expect(encodeBase64('~~~?', true)).toBe('fn5-Pw');
  });

  it('handles long text', () => {
    const text = 'a'.repeat(200000);
    expect(decodeBase64(encodeBase64(text)).output).toBe(text);
  });
});

describe('decodeBase64', () => {
  it.each([
    ['SGVsbG8=', 'Hello'],
    ['SGVsbG8', 'Hello'],
    ['SGVs\nbG8=', 'Hello'],
    ['8J-YgA', '😀'],
    ['4KSo4KSu4KS44KWN4KSk4KWH', 'नमस्ते'],
  ])('decodes %j', (text, expected) => {
    expect(decodeBase64(text).output).toBe(expected);
  });

  it.each(['abc$', 'a', '====a', 'a=b='])('rejects %j', (text) => {
    expect(decodeBase64(text).error).toBe('This is not valid Base64.');
  });

  it('explains binary data', () => {
    expect(decodeBase64('/9j/4AAQ').error).toContain('binary data');
  });
});
