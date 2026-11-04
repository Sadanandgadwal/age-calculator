import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { ENERGY_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => ENERGY_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'kcal', to = 'j') => evaluateConversion(text, from, to, ENERGY_UNITS);

describe('energy conversions', () => {
  it.each([
    [1, 'cal', 'j', 4.184],
    [4.184, 'j', 'cal', 1],
    [1, 'kcal', 'cal', 1000],
    [1000, 'cal', 'kcal', 1],
    [1, 'kcal', 'j', 4184],
    [4184, 'j', 'kcal', 1],
    [1, 'kwh', 'j', 3600000],
    [3600000, 'j', 'kwh', 1],
    [1, 'btu', 'j', 1055.05585262],
  ])('%s %s is exactly %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it.each([
    [1, 'kwh', 'btu', 3412.14163],
    [1, 'btu', 'kwh', 0.000293071],
    [1, 'kwh', 'kcal', 860.42065],
    [1, 'kcal', 'kwh', 0.00116222],
    [1, 'btu', 'cal', 252.164401],
  ])('%s %s is about %s %s', (value, from, to, expected) => {
    const digits = expected < 1 ? 8 : 5;
    expect(convert(value, from, to)).toBeCloseTo(expected, digits);
  });

  it('treats calories and kilocalories as different units', () => {
    expect(convert(1, 'kcal', 'j') / convert(1, 'cal', 'j')).toBeCloseTo(1000, 8);
  });

  it('keeps decimal precision', () => {
    expect(convert(2.5, 'kcal', 'cal')).toBe(2500);
    expect(convert(0.5, 'kwh', 'j')).toBe(1800000);
  });

  it('round-trips between every pair of units', () => {
    for (const from of ENERGY_UNITS) {
      for (const to of ENERGY_UNITS) {
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
    expect(run('1000000000000', 'kwh', 'j').result.outputText).toBe('3.6e+18');
    expect(run('0.000001', 'j', 'kwh').result.outputText).toBe('2.777778e-13');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 cal = 4.184 J');
    expect(texts).toContain('1 kcal = 1,000 cal');
    expect(texts).toContain('1 kcal = 4,184 J');
    expect(texts).toContain('1 kWh = 36,00,000 J');
    expect(texts).toContain('1 BTU ≈ 1,055.06 J');
    expect(texts).toContain('1 kWh ≈ 3,412.14 BTU');
  });
});
