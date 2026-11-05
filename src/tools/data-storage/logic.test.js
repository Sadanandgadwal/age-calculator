import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { STORAGE_UNITS, evaluateStorage } from './logic.js';

const output = (text, from, to) => evaluateStorage(text, from, to).result.output;
const summary = (text, from, to) => evaluateStorage(text, from, to).result.summary;

describe('decimal units', () => {
  it.each([
    [1, 'kb', 'b', 1000],
    [1, 'mb', 'kb', 1000],
    [1, 'gb', 'mb', 1000],
    [1, 'tb', 'gb', 1000],
    [1, 'pb', 'tb', 1000],
    [1000, 'mb', 'gb', 1],
    [1, 'gb', 'b', 1000000000],
    [1, 'pb', 'b', 1000000000000000],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(output(String(value), from, to)).toBe(expected);
  });
});

describe('binary units', () => {
  it.each([
    [1, 'kib', 'b', 1024],
    [1, 'mib', 'kib', 1024],
    [1, 'gib', 'mib', 1024],
    [1, 'tib', 'gib', 1024],
    [1, 'pib', 'tib', 1024],
    [1024, 'mib', 'gib', 1],
    [1, 'gib', 'b', 1073741824],
    [1, 'tib', 'b', 1099511627776],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(output(String(value), from, to)).toBe(expected);
  });
});

describe('between decimal and binary', () => {
  it('keeps the two systems distinct', () => {
    expect(output('1', 'gb', 'gib')).toBeCloseTo(0.931322574615, 10);
    expect(output('1', 'gib', 'gb')).toBeCloseTo(1.073741824, 10);
    expect(output('1', 'kib', 'kb')).toBe(1.024);
  });

  it('matches the advertised drive example', () => {
    expect(output('500', 'gb', 'gib')).toBeCloseTo(465.661287308, 6);
  });
});

describe('exact display', () => {
  it('shows large byte counts exactly', () => {
    expect(summary('1', 'gib', 'b')).toBe('1 GiB = 1,07,37,41,824 B');
    expect(summary('1', 'tib', 'b')).toBe('1 TiB = 10,99,51,16,27,776 B');
    expect(summary('3', 'tib', 'b')).toBe('3 TiB = 32,98,53,48,83,328 B');
  });

  it('keeps exact fractions', () => {
    expect(summary('1000', 'mib', 'gib')).toBe('1,000 MiB = 0.9765625 GiB');
    expect(summary('1.5', 'gb', 'mb')).toBe('1.5 GB = 1,500 MB');
  });

  it('marks rounded results as approximate', () => {
    expect(summary('1', 'gb', 'gib')).toContain('≈');
  });
});

describe('every pair', () => {
  it('round-trips', () => {
    for (const from of STORAGE_UNITS) {
      for (const to of STORAGE_UNITS) {
        const there = output('7.25', from.id, to.id);
        const back = (there * to.factor) / from.factor;
        expect(back, `${from.id} to ${to.id}`).toBeCloseTo(7.25, 6);
      }
    }
  });
});

describe('edge cases', () => {
  it('handles zero, and rejects negative and invalid values', () => {
    expect(output('0', 'gb', 'mb')).toBe(0);
    expect(evaluateStorage('-1', 'gb', 'mb').error).toBe('Please enter a value of 0 or more.');
    expect(evaluateStorage('abc', 'gb', 'mb').error).toBe('Please enter a valid number.');
    expect(evaluateStorage('', 'gb', 'mb')).toEqual({});
  });

  it('handles very large and very small values', () => {
    expect(evaluateStorage('1000000', 'pib', 'b').result.outputText).toBe('1.1259e+21');
    expect(evaluateStorage('1', 'b', 'pb').result.outputText).toBe('1e-15');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 GB = 1,000 MB');
    expect(texts).toContain('1 GiB = 1,024 MiB');
    expect(texts).toContain('1 KiB = 1,024 B');
    expect(texts).toContain('1 GB ≈ 0.931323 GiB');
    expect(texts).toContain('500 GB ≈ 465.661 GiB');
  });
});
