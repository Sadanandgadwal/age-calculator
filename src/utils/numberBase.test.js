import { describe, expect, it } from 'vitest';
import { baseName, describeParseError, divisionSteps, formatInBase, groupDigits, parseInBase, placeValueWorking } from './numberBase.js';

describe('parseInBase', () => {
  it('reads numbers in any base', () => {
    expect(parseInBase('1011', 2).value).toBe(11n);
    expect(parseInBase('ff', 16).value).toBe(255n);
    expect(parseInBase('Z', 36).value).toBe(35n);
    expect(parseInBase('777', 8).value).toBe(511n);
  });

  it('accepts prefixes, spaces, underscores and a minus sign', () => {
    expect(parseInBase('0b1010 1010', 2).value).toBe(170n);
    expect(parseInBase('0xFF_FF', 16).value).toBe(65535n);
    expect(parseInBase('-42', 10).value).toBe(-42n);
  });

  it('handles numbers far beyond normal integer limits', () => {
    expect(parseInBase('1'.repeat(100), 2).value).toBe(2n ** 100n - 1n);
  });

  it('reports problems', () => {
    expect(parseInBase('  ', 2)).toEqual({ error: 'empty' });
    expect(parseInBase('-', 10)).toEqual({ error: 'empty' });
    expect(parseInBase('102', 2)).toEqual({ error: 'digit', character: '2' });
    expect(parseInBase('1'.repeat(1001), 2)).toEqual({ error: 'long' });
  });

  it('describes problems', () => {
    expect(describeParseError('digit', 2, '2')).toBe('"2" is not a binary digit. Use 0 to 1.');
    expect(describeParseError('digit', 16, 'g')).toBe('"G" is not a hexadecimal digit. Use 0 to 9 and A to F.');
    expect(describeParseError('empty', 10)).toBe('Please enter a number.');
    expect(baseName(5)).toBe('Base 5');
  });
});

describe('formatting', () => {
  it('writes and groups digits', () => {
    expect(formatInBase(255n, 16)).toBe('FF');
    expect(formatInBase(-5n, 2)).toBe('-101');
    expect(groupDigits('101010', 4)).toBe('10 1010');
    expect(groupDigits('-1234567', 3)).toBe('-1 234 567');
  });
});

describe('working', () => {
  it('shows place values', () => {
    expect(placeValueWorking(11n, 2)).toBe('1 × 2³ + 0 × 2² + 1 × 2¹ + 1 × 2⁰ = 8 + 0 + 2 + 1 = 11');
    expect(placeValueWorking(255n, 16)).toBe('15 × 16¹ + 15 × 16⁰ = 240 + 15 = 255');
    expect(placeValueWorking(2n ** 20n, 2)).toBeNull();
  });

  it('shows repeated division', () => {
    expect(divisionSteps(11n, 2)).toEqual([
      { dividend: '11', quotient: '5', remainder: '1' },
      { dividend: '5', quotient: '2', remainder: '1' },
      { dividend: '2', quotient: '1', remainder: '0' },
      { dividend: '1', quotient: '0', remainder: '1' },
    ]);
    expect(divisionSteps(255n, 16).map(({ remainder }) => remainder)).toEqual(['F', 'F']);
    expect(divisionSteps(0n, 16)).toHaveLength(1);
    expect(divisionSteps(2n ** 70n, 2)).toBeNull();
  });
});
