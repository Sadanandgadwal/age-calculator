import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate, formatMonths, simulate } from './logic.js';
import { calculateEmi } from '../emi/logic.js';

const result = (values) => evaluate({ balance: '1000000', rate: '8.5', tenure: '20', extra: '5000', ...values }).result;
const errors = (values) => evaluate({ balance: '1000000', rate: '8.5', tenure: '20', extra: '5000', ...values }).errors;

describe('simulate', () => {
  it('matches the EMI calculator without extra payments', () => {
    const { before, emi } = result({ extra: '0' });
    const reference = calculateEmi({ amount: 1000000, rate: 8.5, months: 240 });
    expect(emi).toBe(reference.emi);
    expect(before.months).toBe(240);
    expect(before.totalInterest).toBe(reference.totalInterest);
  });

  it('stops when a payment cannot cover the interest', () => {
    expect(simulate(100000, 12, 500)).toBeNull();
  });
});

describe('savings', () => {
  it('shortens the loan and saves interest', () => {
    const value = result({});
    expect(value).toMatchObject({ emi: 867823, payment: 1367823, monthsSaved: 136, interestSaved: 66906737 });
    expect(value.after.months).toBe(104);
    expect(value.after.years).toHaveLength(9);
    expect(value.after.years.at(-1).balance).toBe(0);
  });

  it('works with a 0% rate and part years', () => {
    expect(result({ rate: '0', tenure: '5', extra: '0', balance: '500000' })).toMatchObject({ monthsSaved: 0, interestSaved: 0 });
    expect(result({ balance: '500000', rate: '10', tenure: '7.5', extra: '2000' })).toMatchObject({ monthsSaved: 24, interestSaved: 6147831 });
  });
});

describe('formatMonths', () => {
  it('writes years and months', () => {
    expect(formatMonths(104)).toBe('8 years 8 months');
    expect(formatMonths(12)).toBe('1 year');
    expect(formatMonths(1)).toBe('1 month');
    expect(formatMonths(0)).toBe('0 months');
  });
});

describe('validation', () => {
  it('checks each value', () => {
    expect(errors({ balance: '', rate: '60', tenure: '0', extra: '-1' })).toEqual({
      balance: 'Please enter the loan balance.',
      rate: 'The interest rate must be between 0 and 50%.',
      tenure: 'The tenure must be greater than 0.',
      extra: "The extra payment can't be negative.",
    });
    expect(errors({ tenure: '7.33' }).tenure).toBe('The tenure must be a whole number of months, such as 7.5 years.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result({});
    expect(buildResultText(value).split('\n').slice(0, 3)).toEqual(['Interest saved: ₹6,69,067.37', 'Time saved: 11 years 4 months', 'New payoff time: 8 years 8 months']);
    const report = buildReport(value);
    expect(report.inputs[2]).toEqual({ label: 'Remaining tenure', value: '20 years' });
    expect(report.table.rows).toHaveLength(9);
    expect(report.table.columns).toEqual(['Year', 'Principal', 'Interest', 'Balance']);
  });
});
