import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate, formatGpa, getScale, gradePoints } from './logic.js';

const course = (id, grade, credits, name = '') => ({ id, name, grade, credits });
const none = { gpa: '', credits: '' };

describe('scales', () => {
  it('has the 4.0 and 10-point grades', () => {
    expect(gradePoints(getScale('four'), 'B+')).toBe(3.3);
    expect(gradePoints(getScale('ten'), 'O')).toBe(10);
    expect(gradePoints(getScale('ten'), 'B−')).toBeUndefined();
    expect(getScale('nope').id).toBe('four');
  });
});

describe('evaluate', () => {
  it('weights grades by credits on the 4.0 scale', () => {
    const { result } = evaluate('four', [course(1, 'A', '4'), course(2, 'B+', '3')], none);
    expect(result.totalCredits).toBe(7);
    expect(result.totalPoints).toBeCloseTo(25.9);
    expect(formatGpa(result.gpa)).toBe('3.70');
    expect(result.cumulative).toBeNull();
  });

  it('works on the 10-point scale', () => {
    const { result } = evaluate('ten', [course(1, 'O', '4'), course(2, 'A', '3'), course(3, 'B+', '3')], none);
    expect(formatGpa(result.gpa)).toBe('8.50');
  });

  it('adds previous results for a cumulative GPA', () => {
    const { result } = evaluate('four', [course(1, 'A', '4'), course(2, 'B+', '3')], { gpa: '3.5', credits: '30' });
    expect(formatGpa(result.cumulative)).toBe('3.54');
  });

  it('skips blank rows and names courses', () => {
    const { result } = evaluate('four', [course(1, '', ''), course(2, 'A', '3', ' Maths ')], none);
    expect(result.courses).toEqual([{ name: 'Maths', grade: 'A', points: 4, credits: 3 }]);
    expect(evaluate('four', [course(1, 'A', '3')], none).result.courses[0].name).toBe('Course 1');
  });
});

describe('validation', () => {
  it('needs at least one course', () => {
    expect(evaluate('four', [course(1, '', ''), course(2, '', '')], none).errors).toEqual({ 1: { grade: 'Please add at least one course with a grade and credits.' } });
  });

  it('checks each started row', () => {
    expect(evaluate('four', [course(1, 'A', ''), course(2, '', '3')], none).errors).toEqual({ 1: { credits: 'Please enter the credits.' }, 2: { grade: 'Please choose a grade.' } });
    expect(evaluate('four', [course(1, 'A', '0')], none).errors[1].credits).toBe('Credits must be greater than 0.');
    expect(evaluate('four', [course(1, 'A', '31')], none).errors[1].credits).toBe('Credits must be 30 or less.');
  });

  it('needs both previous fields within the scale', () => {
    expect(evaluate('four', [course(1, 'A', '3')], { gpa: '3', credits: '' }).errors.previousCredits).toBe('Please enter your previous credits, or clear both previous fields.');
    expect(evaluate('four', [course(1, 'A', '3')], { gpa: '4.5', credits: '10' }).errors.previousGpa).toBe('The GPA must be between 0 and 4.');
    expect(evaluate('ten', [course(1, 'A', '3')], { gpa: '9.5', credits: '10' }).errors).toEqual({});
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const { result } = evaluate('four', [course(1, 'A', '4', 'Maths'), course(2, 'B+', '3')], { gpa: '3.5', credits: '30' });
    expect(buildResultText(result)).toBe('GPA: 3.70 out of 4\nCumulative GPA: 3.54\nTotal credits: 7\nMaths: A, 4 credits\nCourse 2: B+, 3 credits');
    const report = buildReport(result);
    expect(report.inputs).toEqual([
      { label: '1. Maths', value: 'A (4 points), 4 credits' },
      { label: '2. Course 2', value: 'B+ (3.3 points), 3 credits' },
      { label: 'Previous GPA', value: '3.50 over 30 credits' },
    ]);
    expect(report.results).toEqual([{ label: 'GPA', value: '3.70 out of 4' }, { label: 'Cumulative GPA', value: '3.54' }]);
  });
});
