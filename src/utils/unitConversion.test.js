import { describe, expect, it } from 'vitest';
import { buildConversionText, buildExamples, convertUnits, evaluateConversion, formatQuantity, relation } from './unitConversion.js';

const UNITS = [
  { id: 'big', name: 'Bigs', symbol: 'B', factor: 1000 },
  { id: 'unit', name: 'Units', symbol: 'U', factor: 1 },
  { id: 'odd', name: 'Odds', symbol: 'O', factor: 3 },
];
const [big, unit, odd] = UNITS;

describe('convertUnits', () => {
  it('converts through the shared base unit', () => {
    expect(convertUnits(2, big, unit)).toBe(2000);
    expect(convertUnits(500, unit, big)).toBe(0.5);
    expect(convertUnits(6, unit, odd)).toBe(2);
  });

  it('removes floating point errors', () => {
    expect(convertUnits(1.1, big, unit)).toBe(1100);
    expect(convertUnits(0.3, unit, odd)).toBe(0.1);
  });
});

describe('formatQuantity', () => {
  it('groups digits and keeps significant decimals', () => {
    expect(formatQuantity(1234567.891)).toBe('12,34,567.891');
    expect(formatQuantity(0)).toBe('0');
    expect(formatQuantity(0.000125)).toBe('0.000125');
  });

  it('uses scientific notation for extreme values', () => {
    expect(formatQuantity(1e15)).toBe('1e+15');
    expect(formatQuantity(1.5e20)).toBe('1.5e+20');
    expect(formatQuantity(2e-7)).toBe('2e-7');
    expect(formatQuantity(1.234567e-9)).toBe('1.234567e-9');
  });
});

describe('relation', () => {
  it('uses equals only when the displayed value is exact', () => {
    expect(relation(1000, '1,000')).toBe('=');
    expect(relation(2.20462262, '2.20462')).toBe('≈');
  });
});

describe('evaluateConversion', () => {
  const run = (text, from = 'big', to = 'unit') => evaluateConversion(text, from, to, UNITS);

  it('returns nothing for an empty value', () => {
    expect(run('')).toEqual({});
    expect(run('  ')).toEqual({});
  });

  it('describes the conversion', () => {
    const { result } = run('2.5');
    expect(result.output).toBe(2500);
    expect(result.summary).toBe('2.5 B = 2,500 U');
    expect(result.formula).toBe('Units = Bigs × 1,000');
    expect(result.unitRate).toBe('1 B = 1,000 U');
  });

  it('uses approximately when the result is rounded', () => {
    expect(run('1', 'unit', 'odd').result.summary).toBe('1 U ≈ 0.3333333333 O');
  });

  it('converts zero and the same unit', () => {
    expect(run('0').result.output).toBe(0);
    expect(run('5', 'unit', 'unit').result.summary).toBe('5 U = 5 U');
  });

  it('rejects invalid and negative values', () => {
    expect(run('abc').error).toBe('Please enter a valid number.');
    expect(run('1,000').error).toBe('Please enter a valid number.');
    expect(run('-1').error).toBe('Please enter a value of 0 or more.');
  });

  it('rejects values beyond what can be represented', () => {
    expect(run(`1${'0'.repeat(306)}`).error).toBe('This value is too large to convert.');
    expect(run(`0.${'0'.repeat(322)}1`, 'unit', 'big').error).toBe('This value is too small to convert.');
  });
});

describe('text builders', () => {
  it('builds examples from real conversions', () => {
    expect(buildExamples(UNITS, [['big', 'unit'], ['unit', 'odd']])).toEqual([
      { title: 'Bigs to Units', text: '1 B = 1,000 U' },
      { title: 'Units to Odds', text: '1 U ≈ 0.333333 O' },
    ]);
  });

  it('builds examples for a chosen amount', () => {
    expect(buildExamples(UNITS, [['unit', 'big', 100]])).toEqual([{ title: 'Units to Bigs', text: '100 U = 0.1 B' }]);
  });

  it('adds extra details to copied text', () => {
    const { result } = evaluateConversion('2', 'big', 'unit', UNITS);
    expect(buildConversionText(result, [{ label: 'Extra', value: 'Detail' }])).toContain('Extra: Detail');
  });

  it('builds copied text', () => {
    const text = buildConversionText(evaluateConversion('2', 'big', 'unit', UNITS).result);
    expect(text).toBe('2 B = 2,000 U\nFormula: Units = Bigs × 1,000\n1 B = 1,000 U');
  });
});
