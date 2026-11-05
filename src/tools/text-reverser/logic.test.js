import { describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

describe('Text Reverser', () => {
  it.each([
    ['characters', 'Hello', 'olleH'],
    ['characters', 'a😀b', 'b😀a'],
    ['characters', 'é!', '!é'],
    ['words', 'one two three', 'three two one'],
    ['words', 'one  two\nthree four', 'two  one\nfour three'],
    ['words', 'Hello, world!', 'world! Hello,'],
    ['lines', 'a\nb\nc', 'c\nb\na'],
  ])('%s reverses %j', (mode, text, expected) => {
    expect(evaluate(mode, text)).toBe(expected);
  });

  it('has no result for empty text', () => {
    expect(evaluate('words', '')).toBeNull();
  });

  it('builds the report', () => {
    const report = buildReport('lines', 'a b\nc', 'c\na b');
    expect(report.results).toEqual([{ label: 'Words', value: '3' }, { label: 'Lines', value: '2' }]);
    expect(report.text.value).toBe('c\na b');
  });
});
