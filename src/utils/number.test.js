import { describe, expect, it } from 'vitest';
import { ceilTo2, formatDecimal, parseDecimal, roundTo2 } from './number.js';

describe('parseDecimal', () => {
  it.each([
    ['5', 5],
    [' 5.5 ', 5.5],
    ['.5', 0.5],
    ['5.', 5],
    ['-5', -5],
    ['0', 0],
  ])('parses %s', (text, value) => {
    expect(parseDecimal(text)).toBe(value);
  });

  it.each(['', '  ', 'abc', '1e5', '1,000', '--5', '5.5.5', null, undefined])('rejects %s', (text) => {
    expect(parseDecimal(text)).toBeNull();
  });
});

describe('number helpers', () => {
  it('rounds to two decimals', () => {
    expect(roundTo2(1.005)).toBe(1.01);
    expect(roundTo2(66.6666)).toBe(66.67);
  });

  it('rounds up to two decimals without floating point errors', () => {
    expect(ceilTo2(1.001)).toBe(1.01);
    expect(ceilTo2(0.1 + 0.2)).toBe(0.3);
  });

  it('formats with Indian digit grouping', () => {
    expect(formatDecimal(1234567.891)).toBe('12,34,567.89');
  });
});
