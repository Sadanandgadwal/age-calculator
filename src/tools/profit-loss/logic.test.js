import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate } from './logic.js';

const result = (mode, a, b) => evaluate(mode, a, b).result;
const errors = (mode, a, b) => evaluate(mode, a, b).errors;

describe('profit or loss', () => {
  it('finds a profit', () => {
    expect(result('result', '800', '1000')).toMatchObject({ cost: 80000, sale: 100000, difference: 20000, kind: 'Profit', percent: 25, margin: 20 });
  });

  it('finds a loss', () => {
    expect(result('result', '1000', '800')).toMatchObject({ difference: -20000, kind: 'Loss', percent: -20, margin: -25 });
  });

  it('handles breaking even', () => {
    expect(result('result', '500', '500')).toMatchObject({ kind: 'No profit or loss', percent: 0 });
  });
});

describe('finding prices', () => {
  it('finds the selling price', () => {
    expect(result('selling', '800', '25').sale).toBe(100000);
    expect(result('selling', '800', '-10').sale).toBe(72000);
  });

  it('finds the cost price', () => {
    expect(result('cost', '1000', '25').cost).toBe(80000);
    expect(result('cost', '900', '-10').cost).toBe(100000);
  });
});

describe('validation', () => {
  it('needs positive prices and a possible loss', () => {
    expect(errors('result', '', '0')).toEqual({ a: 'Please enter the cost price.', b: 'The selling price must be greater than 0.' });
    expect(errors('selling', '800', '-100').b).toBe('A loss must be less than 100%.');
    expect(errors('cost', '1e14', '5').a).toBe('Please enter a valid number, without commas or symbols.');
    expect(errors('cost', '99999999999999', '5').a).toBe('This amount is too large to calculate.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const loss = result('result', '1000', '800');
    expect(buildResultText(loss)).toBe('Loss: ₹200.00\nLoss %: 20%\nMargin: -25%\nCost price: ₹1,000.00\nSelling price: ₹800.00\nResult: Loss');
    const report = buildReport(MODES[1], '800', '25', result('selling', '800', '25'));
    expect(report.inputs[1]).toEqual({ label: 'Profit % (use a minus sign for a loss)', value: '25%' });
    expect(report.results).toEqual([{ label: 'Result', value: 'Profit' }, { label: 'Profit', value: '₹200.00' }, { label: 'Profit %', value: '25%' }]);
  });
});
