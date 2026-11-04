import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { TEMPERATURE_UNITS, convertTemperature, evaluateTemperature } from './logic.js';

describe('convertTemperature', () => {
  it.each([
    [0, 'c', 'f', 32],
    [100, 'c', 'f', 212],
    [37, 'c', 'f', 98.6],
    [-40, 'c', 'f', -40],
    [32, 'f', 'c', 0],
    [212, 'f', 'c', 100],
    [98.6, 'f', 'c', 37],
    [-40, 'f', 'c', -40],
    [0, 'c', 'k', 273.15],
    [100, 'c', 'k', 373.15],
    [273.15, 'k', 'c', 0],
    [0, 'k', 'c', -273.15],
    [32, 'f', 'k', 273.15],
    [212, 'f', 'k', 373.15],
    [273.15, 'k', 'f', 32],
    [0, 'k', 'f', -459.67],
    [36.6, 'c', 'f', 97.88],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convertTemperature(value, from, to)).toBe(expected);
  });

  it('keeps the same value for the same unit', () => {
    for (const { id } of TEMPERATURE_UNITS) expect(convertTemperature(25.5, id, id)).toBe(25.5);
  });

  it('round-trips between every pair of units', () => {
    for (const from of TEMPERATURE_UNITS) {
      for (const to of TEMPERATURE_UNITS) {
        const there = convertTemperature(321.5, from.id, to.id);
        expect(convertTemperature(there, to.id, from.id), `${from.id} to ${to.id}`).toBeCloseTo(321.5, 8);
      }
    }
  });
});

describe('evaluateTemperature', () => {
  it('returns nothing for empty input', () => {
    expect(evaluateTemperature('', 'c', 'f')).toEqual({});
    expect(evaluateTemperature('  ', 'c', 'f')).toEqual({});
  });

  it('describes the conversion', () => {
    const { result } = evaluateTemperature('100', 'c', 'f');
    expect(result.outputText).toBe('212 °F');
    expect(result.summary).toBe('100 °C = 212 °F');
    expect(result.formula).toBe('°F = (°C × 9/5) + 32');
    expect(result.to.name).toBe('Fahrenheit');
  });

  it('accepts zero, negatives and decimals', () => {
    expect(evaluateTemperature('0', 'c', 'k').result.summary).toBe('0 °C = 273.15 K');
    expect(evaluateTemperature('-40', 'c', 'f').result.summary).toBe('-40 °C = -40 °F');
    expect(evaluateTemperature('36.6', 'c', 'f').result.summary).toBe('36.6 °C = 97.88 °F');
  });

  it('marks rounded results as approximate', () => {
    expect(evaluateTemperature('1', 'f', 'c').result.summary).toBe('1 °F ≈ -17.22222222 °C');
  });

  it('has a formula for every pair of different units', () => {
    for (const from of TEMPERATURE_UNITS) {
      for (const to of TEMPERATURE_UNITS) {
        const { formula } = evaluateTemperature('100', from.id, to.id).result;
        if (from.id === to.id) expect(formula).toBe('No conversion is needed for the same unit.');
        else expect(formula).toContain('=');
      }
    }
  });

  it('accepts absolute zero exactly', () => {
    expect(evaluateTemperature('0', 'k', 'c').result.output).toBe(-273.15);
    expect(evaluateTemperature('-273.15', 'c', 'k').result.output).toBe(0);
    expect(evaluateTemperature('-459.67', 'f', 'k').result.output).toBe(0);
  });

  it.each([
    ['-1', 'k'],
    ['-273.16', 'c'],
    ['-459.68', 'f'],
  ])('rejects %s %s, below absolute zero', (text, unit) => {
    expect(evaluateTemperature(text, unit, 'k').error).toMatch(/below absolute zero/);
  });

  it.each(['abc', '1,000', '1e5', '--5'])('rejects %s', (text) => {
    expect(evaluateTemperature(text, 'c', 'f').error).toBe('Please enter a valid number.');
  });

  it('handles very large values', () => {
    expect(evaluateTemperature('1000000000000000000', 'c', 'f').result.outputText).toBe('1.8e+18 °F');
    expect(evaluateTemperature(`1${'0'.repeat(309)}`, 'c', 'f').error).toBe('Please enter a valid number.');
  });
});

describe('examples', () => {
  it('match real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('0 °C = 32 °F = 273.15 K');
    expect(convertTemperature(30, 'c', 'f')).toBe(86);
    expect(convertTemperature(30, 'c', 'k')).toBe(303.15);
    expect(convertTemperature(37, 'c', 'k')).toBe(310.15);
  });
});
