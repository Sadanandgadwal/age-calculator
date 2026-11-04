import { describe, expect, it } from 'vitest';
import { MODES, buildResultText, evaluate, formatNumber, getMode } from './logic.js';

const run = (mode, a, b) => evaluate(mode, a, b);
const value = (mode, a, b) => run(mode, a, b).result.value;

describe('calculation modes', () => {
  it('has all nine modes with unique ids', () => {
    expect(MODES).toHaveLength(9);
    expect(new Set(MODES.map(({ id }) => id)).size).toBe(9);
  });

  it.each([
    ['percent-of', '20', '500', 100, '100', '20% of 500 is 100'],
    ['what-percent', '50', '200', 25, '25%', '50 is 25% of 200'],
    ['find-whole', '50', '25', 200, '200', '50 is 25% of 200'],
    ['increase', '500', '20', 600, '600', 'Increase 500 by 20% = 600'],
    ['decrease', '500', '20', 400, '400', 'Decrease 500 by 20% = 400'],
    ['difference', '100', '150', 40, '40%', 'The percentage difference between 100 and 150 is 40%'],
    ['add', '500', '20', 600, '600', '500 + 20% = 600'],
    ['subtract', '500', '20', 400, '400', '500 − 20% = 400'],
    ['change', '100', '150', 50, '50%', 'From 100 to 150 is an increase of 50%'],
  ])('%s of %s and %s', (mode, a, b, expected, display, sentence) => {
    const { result, errors } = run(mode, a, b);
    expect(errors).toEqual({});
    expect(result.value).toBeCloseTo(expected, 10);
    expect(result.display).toBe(display);
    expect(result.sentence).toBe(sentence);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('reports a decrease and no change in percentage change', () => {
    expect(run('change', '200', '150').result.sentence).toBe('From 200 to 150 is a decrease of 25%');
    expect(run('change', '200', '150').result.display).toBe('-25%');
    expect(run('change', '200', '200').result.sentence).toBe('There is no change from 200 to 200');
  });

  it('measures change from a negative start by its size', () => {
    expect(value('change', '-100', '-50')).toBe(50);
  });

  it('gives the same percentage difference in either order', () => {
    expect(value('difference', '100', '150')).toBe(value('difference', '150', '100'));
  });

  it('handles equal values and opposite signs in percentage difference', () => {
    expect(value('difference', '5', '5')).toBe(0);
    expect(value('difference', '-5', '5')).toBe(200);
  });

  it('lets a decrease go below zero', () => {
    expect(value('decrease', '100', '150')).toBe(-50);
  });
});

describe('decimal values', () => {
  it('calculates with decimals', () => {
    expect(value('percent-of', '12.5', '80')).toBe(10);
    expect(value('what-percent', '0.5', '2')).toBe(25);
    expect(run('increase', '19.99', '7.5').result.display).toBe('21.4893');
  });

  it('hides floating point errors', () => {
    expect(run('percent-of', '7', '300').result.display).toBe('21');
    expect(run('percent-of', '0.1', '0.2').result.display).toBe('0.0002');
    expect(run('increase', '0.1', '200').result.display).toBe('0.3');
  });

  it('rounds repeating decimals', () => {
    expect(run('what-percent', '1', '3').result.display).toBe('33.3333%');
  });
});

describe('validation', () => {
  it.each([
    ['what-percent', '5', '0', 'b'],
    ['find-whole', '5', '0', 'b'],
    ['change', '0', '5', 'a'],
    ['difference', '0', '0', 'b'],
  ])('%s rejects division by zero with %s and %s', (mode, a, b, field) => {
    const { errors, result } = run(mode, a, b);
    expect(errors[field]).toMatch(/zero/);
    expect(result).toBeUndefined();
  });

  it('allows zero where nothing divides by it', () => {
    expect(value('percent-of', '0', '500')).toBe(0);
    expect(value('what-percent', '0', '5')).toBe(0);
    expect(value('change', '5', '0')).toBe(-100);
    expect(value('difference', '0', '5')).toBe(200);
  });

  it('requires both values', () => {
    expect(run('percent-of', '', ' ').errors).toEqual({ a: 'Please enter a value.', b: 'Please enter a value.' });
  });

  it.each(['abc', '1e5', '1,000', '5%'])('rejects %s', (text) => {
    expect(run('percent-of', text, '5').errors.a).toBe('Please enter a valid number.');
  });

  it.each(['increase', 'decrease', 'add', 'subtract'])('%s rejects a negative percentage', (mode) => {
    expect(run(mode, '500', '-20').errors.b).toBe('Please enter a percentage of 0 or more.');
  });

  it('allows a negative number', () => {
    expect(value('percent-of', '10', '-50')).toBe(-5);
    expect(value('increase', '-100', '10')).toBe(-110);
  });

  it('rejects results too large to represent', () => {
    const huge = `1${'0'.repeat(305)}`;
    expect(run('percent-of', huge, huge).errors.a).toMatch(/too large/);
  });
});

describe('formatNumber', () => {
  it('groups digits and limits decimals', () => {
    expect(formatNumber(1234567.123456)).toBe('12,34,567.1235');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(-2.5)).toBe('-2.5');
  });

  it('keeps very small numbers visible', () => {
    expect(formatNumber(0.00001234)).toBe('0.00001234');
  });
});

describe('buildResultText', () => {
  it('includes the answer, formula and steps', () => {
    const text = buildResultText(getMode('percent-of'), run('percent-of', '20', '500').result);
    expect(text).toContain('20% of 500 is 100');
    expect(text).toContain('Formula: Result = (X ÷ 100) × Y');
    expect(text).toContain('(20 ÷ 100) × 500');
  });
});
