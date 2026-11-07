import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate, formatYears, getFrequency } from './logic.js';

const result = (values) => evaluate({ principal: '100000', rate: '8', years: '5', frequency: '4', deposit: '', ...values }).result;
const errors = (values) => evaluate({ principal: '100000', rate: '8', years: '5', frequency: '4', deposit: '', ...values }).errors;

describe('compound interest', () => {
  it('matches the compound interest formula', () => {
    expect(result({}).balance / 100).toBeCloseTo(100000 * (1 + 0.08 / 4) ** 20, 2);
    expect(Math.round(result({ rate: '10', years: '1', frequency: '1' }).balance)).toBe(11000000);
  });

  it('adds monthly deposits at the end of each month', () => {
    const value = result({ principal: '0', rate: '12', years: '10', frequency: '12', deposit: '5000' });
    expect(value.balance / 100).toBeCloseTo(5000 * ((1.01 ** 120 - 1) / 0.01), 2);
    expect(value.invested).toBe(60000000);
  });

  it('works out the effective yearly rate', () => {
    expect(result({}).effective).toBeCloseTo(8.243216, 5);
  });

  it('builds a yearly table that ends at the final amount', () => {
    const value = result({ years: '2.5', deposit: '1000' });
    expect(value.years).toHaveLength(3);
    expect(value.years.at(-1).balance).toBe(value.balance);
    expect(value.years[2].deposits).toBe(600000);
  });

  it('keeps the money at a 0% rate', () => {
    expect(result({ rate: '0', deposit: '100' })).toMatchObject({ interest: 0, balance: 10000000 + 600000 });
  });
});

describe('validation', () => {
  it('checks each value', () => {
    expect(errors({ principal: '', rate: '-1', years: '0' })).toEqual({
      principal: 'Please enter the starting amount.',
      rate: 'The interest rate must be between 0 and 50%.',
      years: 'The time must be greater than 0.',
    });
    expect(errors({ years: '2.33' }).years).toBe('The time must be a whole number of months, such as 2.5 years.');
    expect(errors({ principal: '0' }).principal).toBe('Please enter a starting amount, a monthly deposit, or both.');
    expect(getFrequency('x').name).toBe('Quarterly');
    expect(errors({ principal: '1000000000', rate: '50', years: '100' }).years).toBe('The result is too large to show. Try a smaller amount, rate or time.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result({});
    expect(buildResultText(value)).toBe('Final amount: ₹1,48,594.74\nInterest earned: ₹48,594.74\nTotal invested: ₹1,00,000.00\nCompounding: Quarterly\nEffective yearly rate: 8.24%\nTime: 5 years');
    const report = buildReport(value);
    expect(report.table.rows).toHaveLength(5);
    expect(report.inputs.at(-1)).toEqual({ label: 'Monthly deposit', value: '₹0.00' });
    expect(formatYears(30)).toBe('2.5 years (30 months)');
    expect(formatYears(12)).toBe('1 year');
  });
});
