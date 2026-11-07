import { describe, expect, it } from 'vitest';
import { BASES, buildReport, buildResultText, convert } from './logic.js';

describe('convert', () => {
  it('converts between bases', () => {
    expect(convert('255', 10, 2).result.output).toBe('11111111');
    expect(convert('ff', 16, 10).result.output).toBe('255');
    expect(convert('ZZ', 36, 10).result.output).toBe('1295');
    expect(convert('-10', 10, 16).result.output).toBe('-A');
  });

  it('shows the common bases grouped', () => {
    expect(convert('255', 10, 2).result.common).toEqual([
      { base: 2, label: 'Binary', value: '1111 1111' },
      { base: 8, label: 'Octal', value: '377' },
      { base: 10, label: 'Decimal', value: '255' },
      { base: 16, label: 'Hexadecimal', value: 'FF' },
    ]);
  });

  it('waits for input and explains mistakes', () => {
    expect(convert('', 10, 2)).toEqual({});
    expect(convert('12', 2, 10).error).toBe('"2" is not a binary digit. Use 0 to 1.');
  });

  it('lists every base from 2 to 36', () => {
    expect(BASES).toHaveLength(35);
    expect(BASES[0]).toEqual({ id: '2', name: 'Binary (base 2)' });
    expect(BASES[3]).toEqual({ id: '5', name: 'Base 5' });
  });

  it('builds the text and report', () => {
    const { result } = convert('255', 10, 16);
    expect(buildResultText(result).split('\n')[0]).toBe('255 (decimal) = FF (hexadecimal)');
    const report = buildReport(result);
    expect(report.results).toEqual([{ label: 'Hexadecimal', value: 'FF' }]);
    expect(report.details.map(({ label }) => label)).toEqual(['Binary', 'Octal', 'Decimal']);
  });
});
