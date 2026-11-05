import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { VOLUME_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => VOLUME_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'l', to = 'ml') => evaluateConversion(text, from, to, VOLUME_UNITS);

describe('volume conversions', () => {
  it.each([
    [1, 'l', 'ml', 1000],
    [1000, 'ml', 'l', 1],
    [1, 'm3', 'l', 1000],
    [1000, 'l', 'm3', 1],
    [1, 'm3', 'ml', 1000000],
    [1, 'usgal', 'l', 3.785411784],
    [1, 'ukgal', 'l', 4.54609],
    [1, 'usgal', 'cup', 16],
    [16, 'cup', 'usgal', 1],
    [1, 'cup', 'ml', 236.5882365],
    [1, 'ukgal', 'usgal', 1.20094992550],
    [1, 'usgal', 'ukgal', 0.832674184629],
    [1, 'l', 'usgal', 0.264172052358],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('treats US and UK gallons as different units', () => {
    expect(convert(1, 'usgal', 'l')).not.toBe(convert(1, 'ukgal', 'l'));
    expect(convert(1, 'ukgal', 'l')).toBeGreaterThan(convert(1, 'usgal', 'l'));
  });

  it('keeps decimal precision', () => {
    expect(convert(2.5, 'l', 'ml')).toBe(2500);
    expect(convert(0.25, 'usgal', 'cup')).toBe(4);
    expect(convert(1.5, 'm3', 'l')).toBe(1500);
  });

  it('round-trips between every pair of units', () => {
    for (const from of VOLUME_UNITS) {
      for (const to of VOLUME_UNITS) {
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
    expect(run('1000000000000', 'm3', 'ml').result.outputText).toBe('1e+18');
    expect(run('0.000001', 'ml', 'm3').result.outputText).toBe('1e-12');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 L = 1,000 mL');
    expect(texts).toContain('1 m³ = 1,000 L');
    expect(texts).toContain('1 US gal ≈ 3.78541 L');
    expect(texts).toContain('1 UK gal = 4.54609 L');
    expect(texts).toContain('1 US cup ≈ 236.588 mL');
  });
});
