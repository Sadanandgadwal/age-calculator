import { describe, expect, it } from 'vitest';
import { SHORT_NOTE, buildReport, buildResultText, evaluate } from './logic.js';

const result = (values) => evaluate(values).result;

describe('investment return', () => {
  it('works out CAGR and total return', () => {
    expect(result({ invested: '100000', current: '200000', years: '5' })).toMatchObject({ gain: 10000000, absolute: 100, cagr: 14.87, multiple: 2, doubling: 5 });
  });

  it('handles a loss and no change', () => {
    expect(result({ invested: '50000', current: '40000', years: '2' })).toMatchObject({ gain: -1000000, absolute: -20, cagr: -10.56, doubling: null });
    expect(result({ invested: '100000', current: '100000', years: '3' })).toMatchObject({ cagr: 0, doubling: null });
  });

  it('compares investments of different lengths', () => {
    expect(result({ invested: '100', current: '150', years: '3' }).cagr).toBe(14.47);
    expect(result({ invested: '100', current: '170', years: '5' }).cagr).toBe(11.2);
  });

  it('validates the inputs', () => {
    expect(evaluate({ invested: '', current: '0', years: '101' }).errors).toEqual({
      invested: 'Please enter the amount invested.',
      current: 'The current value must be greater than 0.',
      years: 'The time can be up to 100 years.',
    });
  });

  it('builds the text and report', () => {
    const loss = result({ invested: '50000', current: '40000', years: '2' });
    expect(buildResultText(loss)).toBe('Yearly return (CAGR): -10.56%\nTotal return: -20%\nLoss: ₹10,000.00\nGrowth: 0.8×\nTime held: 2 years');
    const short = result({ invested: '10000', current: '25000', years: '0.5' });
    expect(buildResultText(short)).toContain(SHORT_NOTE);
    const report = buildReport(short);
    expect(report.notes).toEqual([SHORT_NOTE]);
    expect(report.inputs[2]).toEqual({ label: 'Time held', value: '0.5 years' });
    expect(report.details.map(({ label }) => label)).toEqual(['Growth', 'Doubles every']);
  });
});
