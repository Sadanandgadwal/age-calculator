import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate, simplify } from './logic.js';

const result = (mode, values) => evaluate(mode, values).result;
const errors = (mode, values) => evaluate(mode, values).errors;

describe('simplify', () => {
  it('divides by the greatest common divisor', () => {
    expect(simplify(12, 16)).toEqual([3, 4]);
    expect(simplify(7, 13)).toEqual([7, 13]);
    expect(simplify(100, 25)).toEqual([4, 1]);
  });

  it('handles decimals', () => {
    expect(simplify(1.5, 2.25)).toEqual([2, 3]);
    expect(simplify(0.1, 0.3)).toEqual([1, 3]);
  });
});

describe('modes', () => {
  it('simplifies with other forms', () => {
    expect(result('simplify', { a: '12', b: '16' })).toMatchObject({ simplest: '3 : 4', oneTo: '1 : 1.33', toOne: '0.75 : 1', shares: '42.86% : 57.14%' });
  });

  it('finds the missing value', () => {
    expect(result('solve', { a: '2', b: '3', c: '10' })).toMatchObject({ answer: 15, statement: '2 : 3 = 10 : 15' });
  });

  it('shares a total so the parts add up', () => {
    expect(result('share', { a: '2', b: '3', c: '1000' })).toMatchObject({ first: 400, second: 600 });
    const { first, second } = result('share', { a: '1', b: '2', c: '100' });
    expect(first + second).toBe(100);
  });
});

describe('validation', () => {
  it('requires positive numbers', () => {
    expect(errors('simplify', { a: '', b: '0' })).toEqual({ a: 'Please enter the first number.', b: 'Please enter a number greater than 0.' });
    expect(errors('solve', { a: '-1', b: '2', c: '3' }).a).toBe('Please enter a number greater than 0.');
  });

  it('limits size and decimals', () => {
    expect(errors('simplify', { a: '2000000000', b: '1' }).a).toBe('Please enter a number up to 1,000,000,000.');
    expect(errors('simplify', { a: '1.1234567', b: '1' }).a).toBe('Please use no more than 6 decimal places.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const shared = result('share', { a: '2', b: '3', c: '1000' });
    expect(buildResultText(shared)).toBe('Part A: 400\nPart B: 600\nRatio: 2 : 3\nShares of the total: 40% : 60%');
    const report = buildReport(MODES[2], { a: '2', b: '3', c: '1000' }, shared);
    expect(report.inputs.map(({ label }) => label)).toEqual(['Total to share', 'Ratio part A', 'Ratio part B']);
    expect(report.results).toEqual([{ label: 'Part A', value: '400' }, { label: 'Part B', value: '600' }]);
    expect(buildReport(MODES[0], { a: '12', b: '16' }, result('simplify', { a: '12', b: '16' })).results).toEqual([{ label: 'Simplest form', value: '3 : 4' }]);
  });
});
