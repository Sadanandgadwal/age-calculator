import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate } from './logic.js';

describe('Line Counter', () => {
  it('has no result for empty text', () => {
    expect(evaluate('')).toBeNull();
  });

  it.each([
    ['one', { lines: 1, nonEmpty: 1, blank: 0 }],
    ['one\ntwo\nthree', { lines: 3, nonEmpty: 3, blank: 0 }],
    ['one\n\ntwo', { lines: 3, nonEmpty: 2, blank: 1 }],
    ['one\n', { lines: 2, nonEmpty: 1, blank: 1 }],
    ['  \n\t', { lines: 2, nonEmpty: 0, blank: 2 }],
  ])('counts %j', (text, expected) => {
    expect(evaluate(text)).toMatchObject(expected);
  });

  it('finds the longest line and the average', () => {
    expect(evaluate('ab\nabcd\nabcd')).toMatchObject({ longest: 4, longestLine: 2 });
    expect(evaluate('ab\nabcd').average).toBe(3);
  });

  it('builds the copied text and report', () => {
    const result = evaluate('a\n\nb');
    expect(buildResultText(result)).toContain('Blank lines: 1');
    expect(buildReport('a\n\nb', result).results[0].value).toBe('3');
  });
});
