import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate } from './logic.js';

const result = (mode, values) => evaluate(mode, values).result;

describe('inflation', () => {
  it('works out a future cost', () => {
    expect(result('future', { amount: '100000', rate: '6', years: '10' })).toMatchObject({ end: 17908477, increase: 79.08, lostShare: 44.16, purchasingPower: 5583948 });
  });

  it('works out the value of past money', () => {
    expect(result('past', { amount: '1000', rate: '7', years: '20' }).end).toBe(386968);
  });

  it('keeps the amount at 0% and allows part years', () => {
    expect(result('future', { amount: '100', rate: '0', years: '5' })).toMatchObject({ end: 10000, increase: 0 });
    expect(result('future', { amount: '100', rate: '10', years: '0.5' }).end).toBe(10488);
  });

  it('validates the inputs', () => {
    expect(evaluate('past', { amount: '', rate: '51', years: '' }).errors).toEqual({
      amount: 'Please enter the amount.',
      rate: 'The inflation rate must be between 0 and 50%.',
      years: 'Please enter the years ago.',
    });
    expect(evaluate('future', { amount: '1000000000000', rate: '50', years: '100' }).errors.years).toBe('The result is too large to show. Try a lower rate or fewer years.');
  });

  it('builds the text and report', () => {
    const value = result('future', { amount: '100000', rate: '6', years: '10' });
    expect(buildResultText(value).split('\n')[0]).toBe('Cost in 10 years: ₹1,79,084.77');
    const report = buildReport(MODES[0], value);
    expect(report.inputs).toEqual([
      { label: 'Cost today (₹)', value: '₹1,00,000.00' },
      { label: 'Inflation', value: '6% a year' },
      { label: 'Years from now', value: '10' },
    ]);
    expect(report.details[0].value).toBe('₹55,839.48');
  });
});
