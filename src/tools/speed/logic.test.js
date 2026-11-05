import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { SPEED_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => SPEED_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'kmh', to = 'mph') => evaluateConversion(text, from, to, SPEED_UNITS);

describe('speed conversions', () => {
  it.each([
    [1, 'ms', 'kmh', 3.6],
    [36, 'kmh', 'ms', 10],
    [1, 'mph', 'kmh', 1.609344],
    [1, 'kn', 'kmh', 1.852],
    [1.852, 'kmh', 'kn', 1],
    [1.609344, 'kmh', 'mph', 1],
    [1, 'kmh', 'mph', 0.621371192237],
    [100, 'kmh', 'mph', 62.1371192237],
    [1, 'ms', 'mph', 2.23693629205],
    [1, 'kn', 'mph', 1.15077944802],
    [1, 'mph', 'ms', 0.44704],
    [1, 'kn', 'ms', 0.514444444444],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('keeps decimal precision', () => {
    expect(convert(2.5, 'ms', 'kmh')).toBe(9);
    expect(convert(0.5, 'kn', 'kmh')).toBe(0.926);
  });

  it('round-trips between every pair of units', () => {
    for (const from of SPEED_UNITS) {
      for (const to of SPEED_UNITS) {
        const there = convertUnits(7.25, from, to);
        expect(convertUnits(there, to, from), `${from.id} to ${to.id}`).toBeCloseTo(7.25, 8);
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
    expect(run('1000000000000000', 'ms', 'kmh').result.outputText).toBe('3.6e+15');
    expect(run('0.000001', 'kmh', 'ms').result.outputText).toBe('2.777778e-7');
  });

  it('marks rounded results as approximate', () => {
    expect(run('100').result.summary).toBe('100 km/h ≈ 62.13711922 mph');
    expect(run('10', 'ms', 'kmh').result.summary).toBe('10 m/s = 36 km/h');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 m/s = 3.6 km/h');
    expect(texts).toContain('1 kn = 1.852 km/h');
    expect(texts).toContain('1 mph ≈ 1.60934 km/h');
    expect(texts).toContain('1 km/h ≈ 0.621371 mph');
  });
});
