import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate } from './logic.js';

const result = (mode, values) => evaluate(mode, values).result;

describe('simple interest', () => {
  it('finds each value from the other three', () => {
    expect(result('interest', { principal: '50000', rate: '8', time: '3' })).toMatchObject({ interest: 1200000, total: 6200000 });
    expect(result('principal', { interest: '12000', rate: '8', time: '3' })).toMatchObject({ principal: 5000000 });
    expect(result('rate', { principal: '50000', interest: '12000', time: '3' })).toMatchObject({ rate: 8 });
    expect(result('time', { principal: '50000', interest: '5000', rate: '8' })).toMatchObject({ time: 1.25, months: 15 });
  });

  it('validates only the fields in use', () => {
    expect(evaluate('interest', { principal: '', rate: '0', time: '101' }).errors).toEqual({
      principal: 'Please enter the principal.',
      rate: 'The rate must be greater than 0.',
      time: 'The time can be up to 100 years.',
    });
    expect(evaluate('principal', { interest: '1', rate: '1', time: '1' }).errors).toEqual({});
  });

  it('refuses results that are too large', () => {
    expect(evaluate('principal', { interest: '9999999999999', rate: '0.01', time: '0.01' }).errors.interest).toBe('The result is too large to show. Try smaller values.');
  });

  it('builds the text and report', () => {
    const value = result('time', { principal: '50000', interest: '5000', rate: '8' });
    expect(buildResultText(value)).toBe('Time: 1.25 years (about 15 months)\nTotal amount: ₹55,000.00\nPrincipal: ₹50,000.00\nInterest: ₹5,000.00\nInterest rate: 8% a year');
    const report = buildReport(MODES[3], { principal: '50000', interest: '5000', rate: '8' }, value);
    expect(report.inputs.map(({ label }) => label)).toEqual(['Principal (₹)', 'Interest (₹)', 'Interest rate (% a year)']);
    expect(report.inputs[2].value).toBe('8%');
    expect(report.formula).toBe('Time = interest × 100 ÷ (P × R)');
  });
});
