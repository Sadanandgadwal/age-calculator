import { describe, expect, it } from 'vitest';
import { CLIPPED_NOTE, buildReport, buildResultText, evaluate, getFormula } from './logic.js';

const result = (values) => evaluate({ formulaId: 'cbse', multiplier: '', ...values }).result;
const errors = (values) => evaluate({ formulaId: 'cbse', multiplier: '', ...values }).errors;

describe('formulas', () => {
  it.each([
    ['cbse', '8.6', 81.7],
    ['aicte', '7.8', 73],
    ['vtu', '8.25', 75],
    ['mumbai', '8', 67.8],
  ])('%s converts %s', (formulaId, cgpa, percent) => {
    expect(result({ cgpa, formulaId }).percent).toBe(percent);
  });

  it('uses a custom multiplier', () => {
    expect(result({ cgpa: '8', formulaId: 'custom', multiplier: '10' }).percent).toBe(80);
  });

  it('falls back to CBSE', () => {
    expect(getFormula('nope').id).toBe('cbse');
  });
});

describe('limits', () => {
  it('caps results outside 0 to 100', () => {
    expect(result({ cgpa: '0.2', formulaId: 'vtu' })).toMatchObject({ percent: 0, clipped: true });
    expect(result({ cgpa: '10', formulaId: 'mumbai' })).toMatchObject({ percent: 82, clipped: false });
    expect(result({ cgpa: '10', formulaId: 'custom', multiplier: '11' })).toMatchObject({ percent: 100, clipped: true });
  });

  it('validates the inputs', () => {
    expect(errors({ cgpa: '' }).cgpa).toBe('Please enter your CGPA.');
    expect(errors({ cgpa: '10.5' }).cgpa).toBe('The CGPA must be between 0 and 10.');
    expect(errors({ cgpa: '8', formulaId: 'custom' }).multiplier).toBe('Please enter the multiplier.');
    expect(errors({ cgpa: '8', formulaId: 'custom', multiplier: '0' }).multiplier).toBe('The multiplier must be greater than 0.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result({ cgpa: '8.6' });
    expect(buildResultText(value)).toBe('Percentage: 81.7%\nCGPA: 8.6 out of 10\nConversion used: Percentage = CGPA × 9.5');
    const report = buildReport(value);
    expect(report.results).toEqual([{ label: 'Percentage', value: '81.7%' }]);
    expect(report.subtitle).toBe('CBSE (CGPA × 9.5)');
    expect(report.notes).toHaveLength(1);
  });

  it('notes a capped result', () => {
    const value = result({ cgpa: '0.2', formulaId: 'vtu' });
    expect(buildResultText(value)).toContain(CLIPPED_NOTE);
    expect(buildReport(value).notes[0]).toBe(CLIPPED_NOTE);
    expect(buildReport(result({ cgpa: '8', formulaId: 'custom', multiplier: '9' })).inputs[1]).toEqual({ label: 'Multiplier', value: '9' });
  });
});
