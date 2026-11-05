import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { FREQUENCY_UNITS } from './logic.js';
import { convertUnits, evaluateConversion } from '../../utils/unitConversion.js';

const unit = (id) => FREQUENCY_UNITS.find((item) => item.id === id);
const convert = (value, from, to) => convertUnits(value, unit(from), unit(to));
const run = (text, from = 'ghz', to = 'mhz') => evaluateConversion(text, from, to, FREQUENCY_UNITS);

describe('frequency conversions', () => {
  it.each([
    [1, 'khz', 'hz', 1000],
    [1000, 'hz', 'khz', 1],
    [1, 'mhz', 'khz', 1000],
    [1, 'mhz', 'hz', 1000000],
    [1, 'ghz', 'mhz', 1000],
    [1, 'ghz', 'khz', 1000000],
    [1, 'ghz', 'hz', 1000000000],
    [1, 'hz', 'ghz', 0.000000001],
    [2400, 'mhz', 'ghz', 2.4],
  ])('%s %s is %s %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it('uses exact powers of 1000', () => {
    expect(FREQUENCY_UNITS.map(({ factor }) => factor)).toEqual([1000 ** 0, 1000 ** 1, 1000 ** 2, 1000 ** 3]);
  });

  it('keeps decimal precision', () => {
    expect(convert(2.4, 'ghz', 'mhz')).toBe(2400);
    expect(convert(88.5, 'mhz', 'khz')).toBe(88500);
    expect(convert(0.1, 'khz', 'hz')).toBe(100);
  });

  it('round-trips between every pair of units', () => {
    for (const from of FREQUENCY_UNITS) {
      for (const to of FREQUENCY_UNITS) {
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
    expect(run('1000000000', 'ghz', 'hz').result.outputText).toBe('1e+18');
    expect(run('0.001', 'hz', 'ghz').result.outputText).toBe('1e-12');
  });
});

describe('common examples', () => {
  it('use real conversions', () => {
    const texts = examples.map(({ text }) => text);
    expect(texts).toContain('1 kHz = 1,000 Hz');
    expect(texts).toContain('1 MHz = 1,000 kHz');
    expect(texts).toContain('1 GHz = 1,000 MHz');
    expect(texts).toContain('1 GHz = 1,00,00,00,000 Hz');
    expect(texts).toContain('500 Hz = 0.5 kHz');
    expect(texts).toContain('2,400 MHz = 2.4 GHz');
  });
});
