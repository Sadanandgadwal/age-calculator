import { describe, expect, it } from 'vitest';
import { buildPairReport, buildPairText, convertPair } from './basePair.js';

const binaryToDecimal = { from: 2, to: 10 };
const decimalToHex = { from: 10, to: 16 };

describe('convertPair', () => {
  it('converts binary to decimal with place-value working', () => {
    const { result } = convertPair('1011', binaryToDecimal);
    expect(result.output).toBe('11');
    expect(result.working).toBe('1 × 2³ + 0 × 2² + 1 × 2¹ + 1 × 2⁰ = 8 + 0 + 2 + 1 = 11');
    expect(result.steps).toBeNull();
    expect(result.others).toEqual([{ label: 'Octal', value: '13' }, { label: 'Hexadecimal', value: 'B' }]);
  });

  it('converts decimal to hex with division working', () => {
    const { result } = convertPair('255', decimalToHex);
    expect(result.output).toBe('FF');
    expect(result.working).toBeNull();
    expect(result.steps.map(({ remainder }) => remainder)).toEqual(['F', 'F']);
  });

  it('skips working for very long numbers', () => {
    const { result } = convertPair('1'.repeat(40), binaryToDecimal);
    expect(result.working).toBeNull();
  });

  it('waits for input and explains mistakes', () => {
    expect(convertPair(' ', binaryToDecimal)).toEqual({});
    expect(convertPair('12', binaryToDecimal).error).toBe('"2" is not a binary digit. Use 0 to 1.');
  });

  it('builds the text and report', () => {
    const { result } = convertPair('255', decimalToHex);
    expect(buildPairText(result)).toBe('255 (decimal) = FF (hexadecimal)\nWorking: 255 ÷ 16 = 15 remainder F; 15 ÷ 16 = 0 remainder F. Remainders read from last to first: FF\nBinary: 1111 1111\nOctal: 377');
    expect(buildPairReport(result)).toEqual({ inputs: [{ label: 'Decimal', value: '255' }], results: [{ label: 'Hexadecimal', value: 'FF' }], details: result.others });
  });
});
