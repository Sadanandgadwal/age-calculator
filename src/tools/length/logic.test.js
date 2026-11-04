import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { LENGTH_UNITS, formatFeetAndInches, getFeetAndInchesDetails } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => LENGTH_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const details = (text, from, to) => getFeetAndInchesDetails(evaluateConversion(text, from, to, LENGTH_UNITS).result);

describe('length conversions', () => {
  it.each([
    [30.48, 'cm', 'ft', 1],
    [1, 'ft', 'cm', 30.48],
    [100, 'cm', 'm', 1],
    [1, 'm', 'cm', 100],
    [1000, 'm', 'km', 1],
    [1, 'km', 'm', 1000],
    [10, 'mm', 'cm', 1],
    [1, 'cm', 'mm', 10],
    [1, 'in', 'cm', 2.54],
    [12, 'in', 'ft', 1],
    [1, 'ft', 'in', 12],
    [1, 'yd', 'ft', 3],
    [3, 'ft', 'yd', 1],
    [1, 'mi', 'ft', 5280],
    [1, 'mi', 'yd', 1760],
    [1, 'mi', 'km', 1.609344],
    [1, 'cm', 'ft', 0.0328083989501],
    [170, 'cm', 'ft', 5.57742782152],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('keeps decimal precision', () => {
    expect(convert(1.5, 'm', 'cm')).toBe(150);
    expect(convert(0.1, 'km', 'm')).toBe(100);
    expect(convert(2.54, 'cm', 'in')).toBe(1);
  });

  it('round-trips between every pair of units', () => {
    for (const from of LENGTH_UNITS) {
      for (const to of LENGTH_UNITS) {
        const there = convertUnits(7.25, from, to);
        expect(convertUnits(there, to, from), `${from.id} to ${to.id}`).toBeCloseTo(7.25, 8);
      }
    }
  });

  it('gives the inverse when units are swapped', () => {
    expect(evaluateConversion('1', 'ft', 'cm', LENGTH_UNITS).result.summary).toBe('1 ft = 30.48 cm');
    expect(evaluateConversion('30.48', 'cm', 'ft', LENGTH_UNITS).result.summary).toBe('30.48 cm = 1 ft');
  });
});

describe('formatFeetAndInches', () => {
  it.each([
    [0, '0 ft 0 in'],
    [11, '0 ft 11 in'],
    [12, '1 ft 0 in'],
    [66.93, '5 ft 6.93 in'],
    [72, '6 ft 0 in'],
  ])('formats %s inches as %s', (inches, text) => {
    expect(formatFeetAndInches(inches)).toBe(text);
  });

  it('never shows 12 inches after rounding', () => {
    expect(formatFeetAndInches(11.999)).toBe('1 ft 0 in');
    expect(formatFeetAndInches(71.998)).toBe('6 ft 0 in');
  });
});

describe('getFeetAndInchesDetails', () => {
  it('is shown for feet and inch results', () => {
    expect(details('170', 'cm', 'ft')).toEqual([{ label: 'Feet and Inches', value: '5 ft 6.93 in' }]);
    expect(details('1', 'm', 'in')).toEqual([{ label: 'Feet and Inches', value: '3 ft 3.37 in' }]);
  });

  it('is not shown for other results', () => {
    expect(details('170', 'cm', 'm')).toEqual([]);
    expect(details('1', 'ft', 'cm')).toEqual([]);
  });

  it('is left out for extremely large lengths', () => {
    expect(details('1000000000000', 'km', 'ft')).toEqual([]);
  });
});

describe('common examples', () => {
  const texts = examples.map(({ text }) => text);

  it('match the expected values', () => {
    expect(texts).toContain('100 cm = 1 m');
    expect(texts).toContain('1 ft = 30.48 cm');
    expect(texts).toContain('1 in = 2.54 cm');
    expect(texts).toContain('1 km = 1,000 m');
  });
});
