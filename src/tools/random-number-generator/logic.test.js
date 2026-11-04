import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, generateNumbers, validate } from './logic.js';

const base = { min: '1', max: '10', count: '3', unique: false };

describe('validate', () => {
  it('accepts a good range', () => {
    expect(validate(base).values).toMatchObject({ min: 1, max: 10, count: 3, size: 10 });
    expect(validate({ ...base, min: '-5', max: '-5', count: '1' }).values.size).toBe(1);
  });

  it.each([
    [{ min: '' }, 'min', 'Please enter the lowest number.'],
    [{ max: '' }, 'max', 'Please enter the highest number.'],
    [{ count: '0' }, 'count', 'Please enter at least 1.'],
    [{ count: '1001' }, 'count', 'Please enter 1,000 or fewer.'],
    [{ min: '1.5' }, 'min', 'Please enter a whole number.'],
    [{ min: '20' }, 'max', 'The highest number must not be below the lowest.'],
    [{ min: '-9007199254740991', max: '9007199254740991' }, 'max', 'This range is too large. Please choose a smaller one.'],
    [{ unique: true, count: '11' }, 'count', 'This range only has 10 different numbers.'],
  ])('rejects %j', (change, field, message) => {
    expect(validate({ ...base, ...change }).errors[field]).toBe(message);
  });
});

describe('generateNumbers', () => {
  const settings = { min: 5, size: 3, count: 500, unique: false, sorted: false };

  it('stays in range and reaches both ends', () => {
    const numbers = generateNumbers(settings);
    expect(numbers).toHaveLength(500);
    expect([...new Set(numbers)].sort()).toEqual([5, 6, 7]);
  });

  it('can avoid repeats, even using the whole range', () => {
    const numbers = generateNumbers({ min: 1, size: 10, count: 10, unique: true, sorted: true });
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('can avoid repeats in a huge range', () => {
    const numbers = generateNumbers({ min: 0, size: 2 ** 52, count: 1000, unique: true, sorted: false });
    expect(new Set(numbers).size).toBe(1000);
  });

  it('can sort', () => {
    const numbers = generateNumbers({ ...settings, sorted: true });
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });
});

describe('output', () => {
  const base2 = { min: 1, max: 9, unique: false, sorted: false };

  it('shows one number as the main result', () => {
    const report = buildReport({ ...base2, numbers: [7] });
    expect(report.results[0]).toEqual({ label: 'Random number', value: '7' });
    expect(report.text).toBeNull();
  });

  it('lists many numbers in full', () => {
    const result = { ...base2, numbers: [7, 8] };
    expect(buildResultText(result)).toBe('7, 8');
    expect(buildReport(result).text.value).toBe('7, 8');
  });
});
