import { describe, expect, it } from 'vitest';
import { buildResultText, calculateEmi, evaluate, monthlyPayment } from './logic.js';

const run = (overrides) => evaluate({ amount: '1000000', rate: '8.5', tenure: '20', unit: 'years', ...overrides });

describe('monthlyPayment', () => {
  it.each([
    [100000000, 8.5, 240, 867823],
    [50000000, 10, 60, 1062352],
    [100000, 12, 12, 8885],
  ])('%s paise at %s%% for %s months is %s paise', (principal, rate, months, emi) => {
    expect(monthlyPayment(principal, rate, months)).toBe(emi);
  });

  it('divides equally at 0%', () => {
    expect(monthlyPayment(6000000, 0, 12)).toBe(500000);
  });
});

describe('calculateEmi', () => {
  const result = calculateEmi({ amount: 1000000, rate: 8.5, months: 240 });

  it('calculates the totals', () => {
    expect(result.emi).toBe(867823);
    expect(result.totalPayment - result.principal).toBe(result.totalInterest);
    expect(result.totalInterest).toBeGreaterThan(108000000);
    expect(result.totalInterest).toBeLessThan(109000000);
  });

  it('repays the loan exactly, with a schedule row for each year', () => {
    expect(result.years).toHaveLength(20);
    expect(result.years.at(-1).balance).toBe(0);
    expect(result.years.reduce((sum, { principal }) => sum + principal, 0)).toBe(result.principal);
    expect(result.years.reduce((sum, { interest }) => sum + interest, 0)).toBe(result.totalInterest);
  });

  it('pays more interest early and less later', () => {
    expect(result.years[0].interest).toBeGreaterThan(result.years.at(-1).interest);
    expect(result.years[0].principal).toBeLessThan(result.years.at(-1).principal);
  });

  it('has no interest at 0%', () => {
    const free = calculateEmi({ amount: 60000, rate: 0, months: 12 });
    expect(free).toMatchObject({ emi: 500000, totalInterest: 0, totalPayment: 6000000 });
  });

  it('absorbs rounding in the last payment at 0%', () => {
    const free = calculateEmi({ amount: 100, rate: 0, months: 3 });
    expect(free.emi).toBe(3333);
    expect(free.totalPayment).toBe(10000);
  });

  it('handles one month and a part year', () => {
    expect(calculateEmi({ amount: 1200, rate: 12, months: 1 })).toMatchObject({ emi: 121200, totalPayment: 121200, totalInterest: 1200 });
    expect(calculateEmi({ amount: 1000, rate: 10, months: 18 }).years).toHaveLength(2);
  });

  it('handles very high rates and long tenures', () => {
    const extreme = calculateEmi({ amount: 1000000, rate: 100, months: 1200 });
    expect(Number.isFinite(extreme.emi)).toBe(true);
    expect(extreme.years.at(-1).balance).toBe(0);
  });
});

describe('evaluate', () => {
  it('converts years to months', () => {
    expect(run({}).result.months).toBe(240);
    expect(run({ tenure: '1.5' }).result.months).toBe(18);
    expect(run({ tenure: '18', unit: 'months' }).result.months).toBe(18);
  });

  it('gives the same answer in years and months', () => {
    expect(run({ tenure: '2' }).result.emi).toBe(run({ tenure: '24', unit: 'months' }).result.emi);
  });

  it('accepts a rate of 0', () => {
    expect(run({ rate: '0' }).result.totalInterest).toBe(0);
  });

  it.each([
    ['amount', '', 'Please enter the loan amount.'],
    ['amount', '0', 'The loan amount must be greater than 0.'],
    ['amount', '-5', 'The loan amount must be greater than 0.'],
    ['amount', '10000000000001', 'This amount is too large to calculate.'],
    ['rate', '', 'Please enter the interest rate.'],
    ['rate', '-1', 'The interest rate must be between 0 and 100.'],
    ['rate', '101', 'The interest rate must be between 0 and 100.'],
    ['tenure', '', 'Please enter the loan tenure.'],
    ['tenure', '0', 'The tenure must be greater than 0.'],
    ['tenure', '101', 'The tenure can be up to 100 years.'],
    ['tenure', '1.01', 'The tenure must be a whole number of months, such as 1.5 years.'],
  ])('rejects %s of %j', (field, value, message) => {
    const { errors, result } = run({ [field]: value });
    expect(errors[field]).toBe(message);
    expect(result).toBeUndefined();
  });

  it('rejects part months', () => {
    expect(run({ tenure: '1.5', unit: 'months' }).errors.tenure).toBe('Please enter a whole number of months.');
    expect(run({ tenure: '1201', unit: 'months' }).errors.tenure).toBe('The tenure can be up to 100 years.');
  });
});

describe('buildResultText', () => {
  it('summarises the loan', () => {
    const text = buildResultText(run({}).result);
    expect(text).toContain('Monthly EMI: ₹8,678.23');
    expect(text).toContain('Tenure: 240 months');
  });
});
