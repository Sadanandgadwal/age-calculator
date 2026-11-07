import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, describeReached, evaluate, formatMonths, monthlyNeeded, monthsNeeded } from './logic.js';

const result = (mode, values) => evaluate(mode, values).result;

describe('monthly saving', () => {
  it('reaches the goal with a return', () => {
    const value = result('monthly', { goal: '1000000', current: '', rate: '8', years: '5' });
    expect(value.monthly).toBe(1360973);
    expect(value.balance).toBeGreaterThanOrEqual(100000000);
    expect(value.balance - 100000000).toBeLessThan(100);
    expect(value.years).toHaveLength(5);
  });

  it('divides evenly at 0%', () => {
    expect(result('monthly', { goal: '1000000', current: '100000', rate: '0', years: '3' }).monthly).toBe(2500000);
  });

  it('needs nothing when savings already reach the goal', () => {
    const value = result('monthly', { goal: '100000', current: '200000', rate: '5', years: '2' });
    expect(value.monthly).toBe(0);
    expect(describeReached(value)).toBe('Your current savings already reach the goal in this time, without saving more.');
    expect(monthlyNeeded(100, 100, 0, 12)).toBe(0);
  });
});

describe('time to reach a goal', () => {
  it('counts the months', () => {
    expect(result('time', { goal: '500000', current: '50000', rate: '7', monthly: '10000' }).months).toBe(40);
    expect(formatMonths(40)).toBe('3 years 4 months');
  });

  it('handles a goal already reached and one out of reach', () => {
    expect(result('time', { goal: '1000', current: '1000', rate: '5', monthly: '0' })).toMatchObject({ months: 0, years: [] });
    expect(monthsNeeded(1e12, 0, 0, 1)).toBeNull();
    expect(evaluate('time', { goal: '1000000000', current: '', rate: '0', monthly: '100' }).errors.monthly).toBe('At this rate the goal takes more than 100 years. Try saving more each month.');
  });
});

describe('validation', () => {
  it('checks each field', () => {
    expect(evaluate('monthly', { goal: '', current: '-1', rate: '31', years: '0' }).errors).toEqual({
      goal: 'Please enter the goal amount.',
      current: "The current savings can't be negative.",
      rate: 'The return must be between 0 and 30%.',
      years: 'The time must be greater than 0.',
    });
    expect(evaluate('monthly', { goal: '0', current: '', rate: '5', years: '1' }).errors.goal).toBe('The goal must be greater than 0.');
    expect(evaluate('time', { goal: '1000', current: '', rate: '5', monthly: '' }).errors.monthly).toBe('Please enter the monthly saving.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result('time', { goal: '500000', current: '50000', rate: '7', monthly: '10000' });
    expect(buildResultText(value).split('\n')[0]).toBe('Time to reach the goal: 3 years 4 months');
    const report = buildReport(MODES[1], value);
    expect(report.inputs[3]).toEqual({ label: 'Monthly saving', value: '₹10,000.00' });
    expect(report.table.rows).toHaveLength(4);
    expect(buildReport(MODES[1], result('time', { goal: '1000', current: '1000', rate: '5', monthly: '0' })).table).toBeNull();
  });
});
