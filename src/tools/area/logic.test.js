import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { AREA_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => AREA_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'sqft', to = 'sqm') => evaluateConversion(text, from, to, AREA_UNITS);

describe('area conversions', () => {
  it.each([
    [1, 'acre', 'sqft', 43560],
    [43560, 'sqft', 'acre', 1],
    [1, 'acre', 'cent', 100],
    [100, 'cent', 'acre', 1],
    [1, 'cent', 'sqft', 435.6],
    [435.6, 'sqft', 'cent', 1],
    [1, 'acre', 'sqyd', 4840],
    [1, 'cent', 'sqyd', 48.4],
    [1, 'sqyd', 'sqft', 9],
    [9, 'sqft', 'sqyd', 1],
    [1, 'hectare', 'sqm', 10000],
    [10000, 'sqm', 'hectare', 1],
    [1, 'sqft', 'sqm', 0.09290304],
    [1, 'sqyd', 'sqm', 0.83612736],
    [1, 'acre', 'sqm', 4046.8564224],
    [1, 'sqm', 'sqft', 10.7639104167],
    [1, 'hectare', 'acre', 2.47105381467],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('keeps decimal precision', () => {
    expect(convert(2.5, 'acre', 'cent')).toBe(250);
    expect(convert(0.5, 'hectare', 'sqm')).toBe(5000);
    expect(convert(1.5, 'cent', 'sqft')).toBe(653.4);
  });

  it('round-trips between every pair of units', () => {
    for (const from of AREA_UNITS) {
      for (const to of AREA_UNITS) {
        const there = convertUnits(7.25, from, to);
        expect(convertUnits(there, to, from), `${from.id} to ${to.id}`).toBeCloseTo(7.25, 7);
      }
    }
  });

  it('handles zero and describes the conversion', () => {
    expect(run('0').result.output).toBe(0);
    expect(run('1', 'acre', 'sqft').result.summary).toBe('1 ac = 43,560 sq ft');
    expect(run('1', 'acre', 'sqft').result.formula).toBe('Square foot = Acre × 43,560');
  });

  it('rejects negative and invalid values, and allows empty input', () => {
    expect(run('-1').error).toBe('Please enter a value of 0 or more.');
    expect(run('abc').error).toBe('Please enter a valid number.');
    expect(run('')).toEqual({});
  });

  it('handles very large and very small values', () => {
    expect(run('1000000000000', 'hectare', 'sqft').result.outputText).toBe('1.076391e+17');
    expect(run('0.000001', 'sqft', 'hectare').result.outputText).toBe('9.290304e-12');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 ac = 43,560 sq ft');
    expect(texts).toContain('1 ac = 100 cent');
    expect(texts).toContain('1 cent = 435.6 sq ft');
    expect(texts).toContain('1 ha ≈ 2.47105 ac');
    expect(texts).toContain('1 sq yd = 9 sq ft');
  });
});
