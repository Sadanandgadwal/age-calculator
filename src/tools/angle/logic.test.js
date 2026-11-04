import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { ANGLE_UNITS, evaluateAngle } from './logic.js';
import { convertUnits } from '../../utils/unitConversion.js';

const unit = (id) => ANGLE_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const summary = (text, from, to) => evaluateAngle(text, from, to).result.summary;

describe('angle conversions', () => {
  it.each([
    [90, 'deg', 'grad', 100],
    [100, 'grad', 'deg', 90],
    [360, 'deg', 'grad', 400],
    [400, 'grad', 'deg', 360],
    [1, 'grad', 'deg', 0.9],
    [180, 'deg', 'rad', Number(Math.PI.toPrecision(12))],
    [360, 'deg', 'rad', Number((2 * Math.PI).toPrecision(12))],
    [90, 'deg', 'rad', Number((Math.PI / 2).toPrecision(12))],
    [Math.PI, 'rad', 'deg', 180],
    [2 * Math.PI, 'rad', 'deg', 360],
    [Math.PI, 'rad', 'grad', 200],
    [1, 'rad', 'deg', 57.2957795131],
    [1, 'deg', 'rad', 0.0174532925199],
    [1, 'rad', 'grad', 63.6619772368],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('keeps decimal precision', () => {
    expect(convert(22.5, 'deg', 'grad')).toBe(25);
    expect(convert(0.9, 'deg', 'grad')).toBe(1);
  });

  it('round-trips between every pair of units', () => {
    for (const from of ANGLE_UNITS) {
      for (const to of ANGLE_UNITS) {
        const there = convertUnits(7.25, from, to);
        expect(convertUnits(there, to, from), `${from.id} to ${to.id}`).toBeCloseTo(7.25, 8);
      }
    }
  });
});

describe('evaluateAngle', () => {
  it('accepts negative angles', () => {
    expect(summary('-90', 'deg', 'grad')).toBe('-90 deg = -100 grad');
    expect(summary('-180', 'deg', 'rad')).toBe('-180 deg ≈ -3.141592654 rad');
  });

  it('does not wrap angles over a full turn', () => {
    expect(summary('720', 'deg', 'grad')).toBe('720 deg = 800 grad');
  });

  it('handles zero', () => {
    expect(evaluateAngle('0', 'deg', 'rad').result.output).toBe(0);
  });

  it('marks results involving π as approximate', () => {
    expect(summary('180', 'deg', 'rad')).toContain('≈');
    expect(summary('1', 'rad', 'deg')).toContain('≈');
  });

  it('rejects invalid input and allows empty input', () => {
    expect(evaluateAngle('abc', 'deg', 'rad').error).toBe('Please enter a valid number.');
    expect(evaluateAngle('1,000', 'deg', 'rad').error).toBe('Please enter a valid number.');
    expect(evaluateAngle('', 'deg', 'rad')).toEqual({});
  });

  it('handles very large and very small values', () => {
    expect(evaluateAngle('1000000000000000', 'deg', 'grad').result.outputText).toBe('1.111111e+15');
    expect(evaluateAngle('0.00000001', 'deg', 'grad').result.outputText).toBe('1.111111e-8');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('90 deg = 100 grad');
    expect(texts).toContain('360 deg = 400 grad');
    expect(texts).toContain('180 deg ≈ 3.14159 rad');
    expect(texts).toContain('1 rad ≈ 57.2958 deg');
    expect(texts).toContain('1 grad = 0.9 deg');
  });
});
