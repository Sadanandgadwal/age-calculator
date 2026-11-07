import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate } from './logic.js';

const result = (mode, amount, rate) => evaluate(mode, amount, rate).result;

describe('sales tax', () => {
  it('adds tax', () => {
    expect(result('add', '250', '8')).toMatchObject({ net: 25000, tax: 2000, gross: 27000 });
    expect(result('add', '40', '7.25')).toMatchObject({ tax: 290, gross: 4290 });
  });

  it('removes tax', () => {
    expect(result('remove', '1120', '12')).toMatchObject({ net: 100000, tax: 12000, gross: 112000 });
  });

  it('always adds up', () => {
    for (const [amount, rate] of [['99.99', '18'], ['1', '7.75'], ['12345.67', '3']]) {
      const { net, tax, gross } = result('remove', amount, rate);
      expect(net + tax).toBe(gross);
    }
  });

  it('handles a 0% rate', () => {
    expect(result('add', '100', '0')).toMatchObject({ tax: 0, gross: 10000 });
  });

  it('validates the inputs', () => {
    expect(evaluate('add', '', '101').errors).toEqual({ amount: 'Please enter the price.', rate: 'The tax rate must be between 0 and 100%.' });
  });

  it('builds the text and report', () => {
    const value = result('add', '250', '8');
    expect(buildResultText(value)).toBe('Tax: ₹20.00\nPrice before tax: ₹250.00\nPrice including tax: ₹270.00\nTax rate: 8%');
    expect(buildReport(MODES[1], '1120', '12', result('remove', '1120', '12')).inputs).toEqual([
      { label: 'Price including tax (₹)', value: '1120' },
      { label: 'Tax rate', value: '12%' },
    ]);
  });
});
