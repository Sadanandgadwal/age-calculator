import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate } from './logic.js';

const result = (mode, a, b) => evaluate(mode, a, b).result;
const errors = (mode, a, b) => evaluate(mode, a, b).errors;

describe('modes', () => {
  it('prices from a markup', () => {
    expect(result('markup', '400', '50')).toMatchObject({ price: 60000, profit: 20000, markup: 50, margin: 33.33 });
  });

  it('prices from a margin', () => {
    expect(result('margin', '600', '40')).toMatchObject({ price: 100000, markup: 66.67, margin: 40 });
  });

  it('finds the markup and margin', () => {
    expect(result('find', '250', '400')).toMatchObject({ profit: 15000, markup: 60, margin: 37.5 });
    expect(result('find', '250', '250')).toMatchObject({ markup: 0, margin: 0 });
  });

  it('turns a 25% markup into a 20% margin', () => {
    expect(result('markup', '100', '25').margin).toBe(20);
  });
});

describe('validation', () => {
  it('checks each value', () => {
    expect(errors('markup', '', '-1')).toEqual({ a: 'Please enter the cost.', b: "The markup can't be negative." });
    expect(errors('margin', '100', '100').b).toBe('The margin must be 0 or more, and less than 100.');
    expect(errors('find', '400', '250').b).toBe("The selling price can't be less than the cost. Use the Profit and Loss Calculator for a loss.");
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result('markup', '400', '50');
    expect(buildResultText(value)).toBe('Selling price: ₹600.00\nMarkup: 50%\nMargin: 33.33%\nCost: ₹400.00\nProfit: ₹200.00');
    const report = buildReport(MODES[0], '400', '50', value);
    expect(report.inputs).toEqual([{ label: 'Cost (₹)', value: '400' }, { label: 'Markup', value: '50%' }]);
    expect(report.results.map(({ label }) => label)).toEqual(['Selling price', 'Markup', 'Margin']);
  });
});
