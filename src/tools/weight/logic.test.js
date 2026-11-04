import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { WEIGHT_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => WEIGHT_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));

describe('weight conversions', () => {
  it.each([
    [1, 'kg', 'g', 1000],
    [1000, 'g', 'kg', 1],
    [1, 'g', 'mg', 1000],
    [1000, 'mg', 'g', 1],
    [1, 't', 'kg', 1000],
    [1000, 'kg', 't', 1],
    [1, 't', 'mg', 1000000000],
    [1, 'lb', 'g', 453.59237],
    [1, 'lb', 'oz', 16],
    [16, 'oz', 'lb', 1],
    [1, 'oz', 'g', 28.349523125],
    [1, 'kg', 'lb', 2.20462262185],
    [1, 'kg', 'oz', 35.2739619496],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('keeps decimal precision', () => {
    expect(convert(2.5, 'kg', 'g')).toBe(2500);
    expect(convert(0.001, 'kg', 'g')).toBe(1);
    expect(convert(1.1, 'kg', 'g')).toBe(1100);
    expect(convert(0.1, 'g', 'mg')).toBe(100);
    expect(convert(123.456, 'g', 'kg')).toBe(0.123456);
  });

  it('round-trips between every pair of units', () => {
    for (const from of WEIGHT_UNITS) {
      for (const to of WEIGHT_UNITS) {
        const there = convertUnits(7.25, from, to);
        expect(convertUnits(there, to, from), `${from.id} to ${to.id}`).toBeCloseTo(7.25, 8);
      }
    }
  });

  it('handles extreme values', () => {
    expect(evaluateConversion('1000000000000', 't', 'mg', WEIGHT_UNITS).result.outputText).toBe('1e+21');
    expect(evaluateConversion('0.000001', 'mg', 't', WEIGHT_UNITS).result.outputText).toBe('1e-15');
  });

  it('describes approximate conversions', () => {
    const { result } = evaluateConversion('1', 'kg', 'lb', WEIGHT_UNITS);
    expect(result.summary).toBe('1 kg ≈ 2.204622622 lb');
    expect(result.formula).toBe('Pound = Kilogram × 2.204622622');
  });
});

describe('common examples', () => {
  const textFor = (title) => examples.find((example) => example.title === title).text;

  it('match the expected values', () => {
    expect(textFor('Kilogram to Gram')).toBe('1 kg = 1,000 g');
    expect(textFor('Gram to Milligram')).toBe('1 g = 1,000 mg');
    expect(textFor('Kilogram to Pound')).toBe('1 kg ≈ 2.20462 lb');
    expect(textFor('Pound to Gram')).toBe('1 lb ≈ 453.592 g');
  });
});
