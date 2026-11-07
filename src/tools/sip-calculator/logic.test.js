import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate, growSip } from './logic.js';

const result = (values) => evaluate({ monthly: '5000', rate: '12', years: '10', stepUp: '', ...values }).result;

describe('growSip', () => {
  it('matches the SIP formula with payments at the start of each month', () => {
    const i = 0.01;
    expect(growSip(500000, 12, 10).value).toBeCloseTo(500000 * (((1 + i) ** 120 - 1) / i) * (1 + i), 4);
  });

  it('raises the SIP each year', () => {
    const { years } = growSip(500000, 12, 3, 10);
    expect(years.map(({ monthly }) => monthly)).toEqual([500000, 550000, 605000]);
  });
});

describe('evaluate', () => {
  it('works out the expected value', () => {
    const value = result({});
    expect(Math.round(value.value)).toBe(116169538);
    expect(value.invested).toBe(60000000);
    expect(value.years).toHaveLength(10);
  });

  it('adds up after a step-up', () => {
    const value = result({ stepUp: '10' });
    expect(value.invested).toBe(95624580);
    expect(Math.round(value.value) - value.invested).toBe(Math.round(value.gains));
  });

  it('returns what was put in at 0%', () => {
    expect(result({ monthly: '1000', rate: '0', years: '1' })).toMatchObject({ value: 1200000, gains: 0 });
  });

  it('validates the inputs', () => {
    expect(evaluate({ monthly: '', rate: '60', years: '1.5', stepUp: '-1' }).errors).toEqual({
      monthly: 'Please enter the monthly investment.',
      rate: 'The return must be between 0 and 50%.',
      years: 'Please enter a whole number.',
      stepUp: 'The yearly increase must be between 0 and 50%.',
    });
    expect(evaluate({ monthly: '1000000000', rate: '50', years: '50', stepUp: '50' }).errors.years).toBe('The result is too large to show. Try a smaller amount, return or time.');
  });

  it('builds the text and report', () => {
    const value = result({ stepUp: '10' });
    expect(buildResultText(value)).toContain('Monthly SIP in the last year: ₹11,789.75');
    const report = buildReport(value);
    expect(report.table.rows).toHaveLength(10);
    expect(report.inputs[3]).toEqual({ label: 'Yearly increase', value: '10%' });
    expect(buildReport(result({})).details).toEqual([]);
  });
});
