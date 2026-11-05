import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { PRESSURE_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => PRESSURE_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'psi', to = 'bar') => evaluateConversion(text, from, to, PRESSURE_UNITS);

describe('pressure conversions', () => {
  it.each([
    [1, 'bar', 'pa', 100000],
    [100000, 'pa', 'bar', 1],
    [1, 'bar', 'kpa', 100],
    [1, 'kpa', 'pa', 1000],
    [1000, 'pa', 'kpa', 1],
    [1, 'atm', 'pa', 101325],
    [1, 'atm', 'kpa', 101.325],
    [1, 'atm', 'bar', 1.01325],
  ])('%s %s is exactly %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it.each([
    [1, 'psi', 'pa', 6894.757293],
    [1, 'psi', 'kpa', 6.894757293],
    [1, 'psi', 'bar', 0.06894757293],
    [1, 'bar', 'psi', 14.503773773],
    [1, 'atm', 'psi', 14.695948775],
    [1, 'psi', 'atm', 0.068045963],
    [32, 'psi', 'bar', 2.206322334],
  ])('%s %s is about %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBeCloseTo(expected, 6);
  });

  it('keeps decimal precision', () => {
    expect(convert(2.5, 'bar', 'kpa')).toBe(250);
    expect(convert(0.5, 'kpa', 'pa')).toBe(500);
  });

  it('round-trips between every pair of units', () => {
    for (const from of PRESSURE_UNITS) {
      for (const to of PRESSURE_UNITS) {
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
    expect(run('100000000000', 'atm', 'pa').result.outputText).toBe('1.01325e+16');
    expect(run('0.000001', 'pa', 'bar').result.outputText).toBe('1e-11');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 atm = 1,01,325 Pa');
    expect(texts).toContain('1 atm = 1.01325 bar');
    expect(texts).toContain('1 bar = 100 kPa');
    expect(texts).toContain('1 bar ≈ 14.5038 psi');
    expect(texts).toContain('1 atm ≈ 14.6959 psi');
  });
});
