import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, flipCoins, summarise, validate } from './logic.js';

describe('validate', () => {
  it.each(['', '0', '1001', '1.5', 'x'])('rejects %j', (text) => {
    expect(validate(text).error).toBeTruthy();
  });

  it('accepts the limits', () => {
    expect(validate('1').value).toBe(1);
    expect(validate('1000').value).toBe(1000);
  });
});

describe('flipCoins', () => {
  it('maps each pick to a side', () => {
    const picks = [0, 1, 1];
    expect(flipCoins(3, () => picks.shift())).toEqual({ flips: ['Heads', 'Tails', 'Tails'], heads: 1, tails: 2 });
  });

  it('asks for a fair choice of two', () => {
    const limits = [];
    flipCoins(2, (limit) => {
      limits.push(limit);
      return 0;
    });
    expect(limits).toEqual([2, 2]);
  });

  it('is close to even over many flips', () => {
    const { heads, tails } = flipCoins(1000);
    expect(heads + tails).toBe(1000);
    expect(heads).toBeGreaterThan(400);
    expect(heads).toBeLessThan(600);
  });
});

describe('output', () => {
  it('describes one flip', () => {
    const result = summarise(['Tails']);
    expect(buildResultText(result)).toBe('Coin flip: Tails');
    const report = buildReport(result);
    expect(report.results).toEqual([{ label: 'Result', value: 'Tails' }]);
    expect(report.text).toBeNull();
  });

  it('describes many flips', () => {
    const result = summarise(['Heads', 'Tails', 'Heads', 'Heads']);
    expect(buildResultText(result)).toContain('Heads: 3 (75%)');
    const report = buildReport(result);
    expect(report.results[1]).toEqual({ label: 'Tails', value: '1' });
    expect(report.text.value).toBe('H T H H');
  });
});
