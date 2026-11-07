import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, describeExtra, evaluate } from './logic.js';

const result = (values) => evaluate({ bill: '1000', percent: '10', people: '1', roundUp: false, ...values }).result;
const errors = (values) => evaluate({ bill: '1000', percent: '10', people: '1', roundUp: false, ...values }).errors;

describe('tip', () => {
  it('adds the tip for one person', () => {
    expect(result({})).toMatchObject({ tip: 10000, total: 110000, perPerson: 110000, extra: 0 });
  });

  it('splits between people', () => {
    expect(result({ bill: '2400', percent: '15', people: '4' })).toMatchObject({ tip: 36000, total: 276000, perPerson: 69000, tipPerPerson: 9000 });
  });

  it('rounds uneven shares up by the paisa', () => {
    const value = result({ people: '3' });
    expect(value).toMatchObject({ perPerson: 36667, total: 110001, tip: 10001, extra: 1 });
    expect(describeExtra(value)).toBe('The total does not divide evenly, so each share is rounded up and the tip gets an extra ₹0.01.');
  });

  it('rounds each share up to the rupee', () => {
    const value = result({ bill: '1234.5', percent: '15', people: '4', roundUp: true });
    expect(value).toMatchObject({ perPerson: 35500, total: 142000, effectivePercent: 15.03 });
    expect(describeExtra(value)).toBe('Rounding up adds ₹0.32 to the tip, making it 15.03% of the bill.');
  });

  it('allows no tip', () => {
    expect(result({ percent: '0', people: '2' })).toMatchObject({ tip: 0, perPerson: 50000 });
  });
});

describe('validation', () => {
  it('checks each value', () => {
    expect(errors({ bill: '', percent: '101', people: '0' })).toEqual({
      bill: 'Please enter the bill amount.',
      percent: 'The tip must be between 0 and 100%.',
      people: 'There must be at least 1 person.',
    });
    expect(errors({ people: '2.5' }).people).toBe('Please enter a whole number.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    expect(buildResultText(result({}))).toBe('Tip: ₹100.00\nTotal: ₹1,100.00\nEach person pays: ₹1,100.00\nBill: ₹1,000.00\nTip percentage: 10%\nPeople: 1');
    const report = buildReport(result({ bill: '1234.5', percent: '15', people: '4', roundUp: true }));
    expect(report.inputs[3]).toEqual({ label: 'Round up each share', value: 'Yes, to the nearest rupee' });
    expect(report.results.map(({ value }) => value)).toEqual(['₹185.50', '₹1,420.00', '₹355.00']);
    expect(report.notes).toHaveLength(1);
  });
});
