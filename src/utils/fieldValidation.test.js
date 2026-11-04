import { describe, expect, it } from 'vitest';
import { checkNumber, collectFields } from './fieldValidation.js';

describe('checkNumber', () => {
  it('returns the value', () => {
    expect(checkNumber('5.5')).toEqual({ value: 5.5 });
    expect(checkNumber(' 0 ')).toEqual({ value: 0 });
  });

  it('requires a value, using the given message', () => {
    expect(checkNumber('').error).toBe('Please enter a value.');
    expect(checkNumber('  ', { required: 'Enter it.' }).error).toBe('Enter it.');
  });

  it.each(['abc', '1,000', '1e5', '₹5'])('rejects %s', (text) => {
    expect(checkNumber(text).error).toMatch(/valid number/);
  });

  it('applies limits and custom messages', () => {
    expect(checkNumber('-1').error).toBe('Please enter a value of 0 or more.');
    expect(checkNumber('0', { aboveMin: true }).error).toBe('Please enter a value greater than 0.');
    expect(checkNumber('5', { aboveMin: true }).value).toBe(5);
    expect(checkNumber('101', { max: 100 }).error).toBe('Please enter a value of 100 or less.');
    expect(checkNumber('101', { max: 100, maxMessage: 'Too high.' }).error).toBe('Too high.');
    expect(checkNumber('-1', { minMessage: 'Too low.' }).error).toBe('Too low.');
    expect(checkNumber('100', { max: 100 }).value).toBe(100);
  });

  it('requires whole numbers when asked', () => {
    expect(checkNumber('1.5', { whole: true }).error).toBe('Please enter a whole number.');
    expect(checkNumber('2', { whole: true }).value).toBe(2);
  });
});

describe('collectFields', () => {
  it('separates values and errors', () => {
    expect(collectFields({ a: { value: 1 }, b: { error: 'Bad' } })).toEqual({
      errors: { b: 'Bad' },
      values: { a: 1 },
      isValid: false,
    });
    expect(collectFields({ a: { value: 0 } }).isValid).toBe(true);
  });
});
