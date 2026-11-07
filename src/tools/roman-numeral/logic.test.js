import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, convert, toRoman } from './logic.js';

describe('Roman numerals', () => {
  it('writes numbers as numerals', () => {
    expect(toRoman(2026)).toBe('MMXXVI');
    expect(toRoman(1994)).toBe('MCMXCIV');
    expect(toRoman(3999)).toBe('MMMCMXCIX');
    expect(toRoman(49)).toBe('XLIX');
  });

  it('reads every numeral back to the same number', () => {
    for (let number = 1; number <= 3999; number += 1) {
      expect(convert(toRoman(number)).result.number).toBe(number);
    }
  });

  it('works in both directions from one field', () => {
    expect(convert(' 14 ').result).toMatchObject({ direction: 'to-roman', roman: 'XIV' });
    expect(convert('mmxxvi').result).toMatchObject({ direction: 'to-number', number: 2026 });
    expect(convert('')).toEqual({});
  });

  it('rejects numbers out of range and bad numerals', () => {
    expect(convert('4000').error).toBe('Roman numerals here cover 1 to 3,999. Please enter a number in that range.');
    expect(convert('0').error).toMatch(/1 to 3,999/);
    expect(convert('IIII').error).toBe('IIII is not a correctly written Roman numeral. Did you mean IV (4)?');
    expect(convert('IC').error).toBe('IC is not a correctly written Roman numeral. Did you mean XCIX (99)?');
    expect(convert('12.5').error).toBe('Please enter a whole number such as 2026, or a Roman numeral using I, V, X, L, C, D and M.');
  });

  it('builds the text and report', () => {
    const { result } = convert('1994');
    expect(buildResultText(result)).toBe('1994 = MCMXCIV\nParts: M = 1,000, CM = 900, XC = 90, IV = 4\nSum: 1000 + 900 + 90 + 4 = 1994');
    expect(buildReport(result).results).toEqual([{ label: 'Roman numeral', value: 'MCMXCIV' }]);
    expect(buildReport(convert('XIV').result).inputs).toEqual([{ label: 'Roman numeral', value: 'XIV' }]);
  });
});
