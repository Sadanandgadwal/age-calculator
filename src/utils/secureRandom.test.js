import { describe, expect, it } from 'vitest';
import { randomBelow, shuffle } from './secureRandom.js';

describe('randomBelow', () => {
  it('stays in range and reaches every value', () => {
    const seen = new Set();
    for (let count = 0; count < 2000; count += 1) seen.add(randomBelow(6));
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('handles the smallest and very large limits', () => {
    expect(randomBelow(1)).toBe(0);
    const value = randomBelow(2 ** 53 - 1);
    expect(Number.isSafeInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  });
});

describe('shuffle', () => {
  it('keeps every item and leaves the source alone', () => {
    const source = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(source);
    expect(source).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...result].sort()).toEqual(source);
  });
});
