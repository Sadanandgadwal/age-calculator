import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { TIME_UNITS, getYearDetails } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => TIME_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'h', to = 'min') => evaluateConversion(text, from, to, TIME_UNITS);

describe('time unit conversions', () => {
  it.each([
    [1, 'min', 's', 60],
    [60, 's', 'min', 1],
    [1, 'h', 'min', 60],
    [1, 'h', 's', 3600],
    [1, 'day', 'h', 24],
    [24, 'h', 'day', 1],
    [1, 'day', 's', 86400],
    [1, 'week', 'day', 7],
    [7, 'day', 'week', 1],
    [1, 'week', 'h', 168],
    [1, 'year', 'day', 365.25],
    [365.25, 'day', 'year', 1],
    [1, 'year', 's', 31557600],
    [1, 'year', 'h', 8766],
    [1, 'year', 'week', 52.1785714286],
    [1, 'day', 'year', 0.00273785078713],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('keeps decimal precision', () => {
    expect(convert(1.5, 'h', 'min')).toBe(90);
    expect(convert(0.1, 'min', 's')).toBe(6);
    expect(convert(2.5, 'week', 'day')).toBe(17.5);
  });

  it('round-trips between every pair of units', () => {
    for (const from of TIME_UNITS) {
      for (const to of TIME_UNITS) {
        const there = convertUnits(7.25, from, to);
        expect(convertUnits(there, to, from), `${from.id} to ${to.id}`).toBeCloseTo(7.25, 7);
      }
    }
  });

  it('handles zero, and rejects negative and invalid values', () => {
    expect(run('0').result.output).toBe(0);
    expect(run('-1').error).toBe('Please enter a value of 0 or more.');
    expect(run('abc').error).toBe('Please enter a valid number.');
    expect(run('')).toEqual({});
  });

  it('handles very large and very small values', () => {
    expect(run('100000000000', 'year', 's').result.outputText).toBe('3.15576e+18');
    expect(run('1', 's', 'year').result.outputText).toBe('3.168809e-8');
  });
});

describe('getYearDetails', () => {
  const details = (from, to) => getYearDetails(run('1', from, to).result);

  it('explains the convention whenever years are involved', () => {
    expect(details('year', 'day')).toEqual([{ label: 'Year Convention', value: '1 year = 365.25 days' }]);
    expect(details('s', 'year')).toHaveLength(1);
  });

  it('stays quiet otherwise', () => {
    expect(details('h', 'min')).toEqual([]);
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 min = 60 s');
    expect(texts).toContain('1 d = 24 h');
    expect(texts).toContain('1 wk = 7 d');
    expect(texts).toContain('1 yr = 365.25 d');
    expect(texts).toContain('1 yr = 3,15,57,600 s');
  });
});
