import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate, perYear, tableColumns } from './logic.js';

const result = (values) => evaluate({ amount: '50000', period: 'month', hours: '40', days: '5', raise: '', ...values }).result;
const errors = (values) => evaluate({ amount: '50000', period: 'month', hours: '40', days: '5', raise: '', ...values }).errors;

describe('salary', () => {
  it('counts periods in a year', () => {
    expect(perYear(40, 5)).toEqual({ hour: 2080, day: 260, week: 52, month: 12, year: 1 });
  });

  it('converts a monthly salary', () => {
    const { pay } = result({});
    expect(pay.year).toBe(60000000);
    expect(Math.round(pay.hour)).toBe(28846);
  });

  it('converts an hourly rate with a raise', () => {
    const value = result({ amount: '500', period: 'hour', raise: '10' });
    expect(value.pay.year).toBe(104000000);
    expect(Math.round(value.pay.month)).toBe(8666667);
    expect(Math.round(value.raised.year)).toBe(114400000);
    expect(tableColumns(value)).toEqual(['Period', 'Pay', 'After 10% raise']);
  });

  it('describes a pay cut', () => {
    expect(tableColumns(result({ raise: '-5' }))).toEqual(['Period', 'Pay', 'After 5% cut']);
  });

  it('uses six-day weeks for daily pay', () => {
    expect(Math.round(result({ amount: '1200000', period: 'year', hours: '48', days: '6' }).pay.day)).toBe(384615);
  });
});

describe('validation', () => {
  it('checks each value', () => {
    expect(errors({ amount: '', hours: '169', days: '8', raise: '-100' })).toEqual({
      amount: 'Please enter your pay.',
      hours: 'A week has 168 hours.',
      days: 'A week has 7 days.',
      raise: 'A pay cut must be less than 100%.',
    });
    expect(errors({ hours: '3', days: '5' }).hours).toBe('Hours a week must be at least the number of days, as each day needs some hours.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result({ amount: '500', period: 'hour', raise: '10' });
    expect(buildResultText(value).split('\n')[0]).toBe('Yearly: ₹10,40,000.00, ₹11,44,000.00 (after 10% raise)');
    expect(buildResultText(result({})).split('\n')).toHaveLength(5);
    const report = buildReport(value);
    expect(report.inputs[0]).toEqual({ label: 'Pay', value: '₹500.00 per hour' });
    expect(report.table.rows[0]).toEqual(['Yearly', '₹10,40,000.00', '₹11,44,000.00']);
  });
});
