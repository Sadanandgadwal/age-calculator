import { describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

describe('Base64 tool', () => {
  it('encodes and decodes', () => {
    expect(evaluate('encode', 'Hello', false).output).toBe('SGVsbG8=');
    expect(evaluate('encode', '😀', true).output).toBe('8J-YgA');
    expect(evaluate('decode', 'SGVsbG8=', false).output).toBe('Hello');
  });

  it('has nothing for empty text, and explains bad input', () => {
    expect(evaluate('encode', '', false)).toEqual({ error: null, output: null });
    expect(evaluate('decode', '***', false)).toEqual({ error: 'This is not valid Base64.', output: null });
  });

  it('builds the report', () => {
    expect(buildReport('encode', true, 'abc').inputs[1].value).toBe('Yes');
    expect(buildReport('decode', true, 'abc').inputs).toHaveLength(1);
    expect(buildReport('decode', false, 'abc').text.title).toBe('Decoded text');
  });
});
