import { describe, expect, it } from 'vitest';
import {
  GRADE_SCALES,
  buildOverallText,
  buildSubjectsText,
  buildTargetText,
  calculateOverall,
  calculateSubjects,
  calculateTarget,
  getGrade,
  validateMarks,
  validateScale,
  validateSubjects,
  validateTarget,
} from './logic.js';

const rowsFor = (scale) => GRADE_SCALES[scale].grades.map(([label, min], index) => ({ id: index, label, min: String(min) }));
const subject = (id, name, max, obtained) => ({ id, name, max, obtained });
const SUBJECTS = [subject(1, ' Maths ', '100', '90'), subject(2, 'Art', '50', '20'), subject(3, 'Music', '50', '40')];

describe('validateMarks', () => {
  it('accepts valid marks, including zero and full marks', () => {
    expect(validateMarks('0', '100')).toEqual({});
    expect(validateMarks('100', '100')).toEqual({});
    expect(validateMarks('45.5', '50')).toEqual({});
  });

  it('rejects negative marks', () => {
    expect(validateMarks('-1', '100').obtained).toBe('Marks cannot be negative.');
  });

  it('rejects obtained marks above the maximum', () => {
    expect(validateMarks('101', '100').obtained).toBe('Obtained marks cannot exceed maximum marks.');
  });

  it.each(['0', '-5'])('rejects a maximum of %s', (max) => {
    expect(validateMarks('0', max).max).toBe('Maximum marks must be greater than zero.');
  });

  it('rejects missing and non-numeric values', () => {
    expect(validateMarks('', '')).toEqual({
      max: 'Please enter the maximum marks.',
      obtained: 'Please enter the obtained marks.',
    });
    expect(validateMarks('abc', '1e3')).toEqual({
      max: 'Please enter a valid number.',
      obtained: 'Please enter a valid number.',
    });
  });
});

describe('validateSubjects', () => {
  it('accepts valid subjects', () => {
    expect(validateSubjects(SUBJECTS)).toEqual({});
  });

  it('rejects an empty or blank subject name', () => {
    expect(validateSubjects([subject(1, '   ', '100', '50')])).toEqual({ 1: { name: 'Please enter a subject name.' } });
  });

  it('reports errors by subject', () => {
    const errors = validateSubjects([subject(1, 'A', '100', '50'), subject(2, 'B', '100', '150')]);
    expect(Object.keys(errors)).toEqual(['2']);
  });
});

describe('calculateSubjects', () => {
  const result = calculateSubjects(SUBJECTS);

  it('calculates totals, percentage and average', () => {
    expect(result.obtained).toBe(150);
    expect(result.max).toBe(200);
    expect(result.percent).toBe(75);
    expect(result.average).toBe(50);
  });

  it('compares subjects by percentage rather than raw marks', () => {
    expect(result.highest).toBe('Maths');
    expect(result.lowest).toBe('Art');
    expect(calculateSubjects([subject(1, 'Small', '10', '10'), subject(2, 'Large', '100', '50')]).highest).toBe('Small');
  });

  it('lists all tied subjects', () => {
    const tied = calculateSubjects([subject(1, 'A', '100', '50'), subject(2, 'B', '50', '25')]);
    expect(tied.highest).toBe('A, B');
    expect(tied.lowest).toBe('A, B');
  });

  it('handles one subject, and trims names', () => {
    const one = calculateSubjects([subject(1, ' Only ', '40', '10')]);
    expect(one.percent).toBe(25);
    expect(one.average).toBe(10);
    expect(one.highest).toBe('Only');
  });

  it('avoids floating point errors with decimal marks', () => {
    const decimals = calculateSubjects([subject(1, 'A', '1', '0.1'), subject(2, 'B', '1', '0.2')]);
    expect(decimals.obtained).toBe(0.3);
    expect(decimals.percent).toBe(15);
  });
});

describe('calculateOverall', () => {
  it('calculates percentage and marks lost', () => {
    expect(calculateOverall('450', '500')).toEqual({ obtained: 450, max: 500, remaining: 50, percent: 90 });
  });

  it('rounds the percentage to two decimals', () => {
    expect(calculateOverall('1', '3').percent).toBe(33.33);
    expect(calculateOverall('2', '3').percent).toBe(66.67);
  });
});

describe('getGrade', () => {
  it.each([
    [100, 'A+'],
    [90, 'A+'],
    [89.99, 'A'],
    [80, 'A'],
    [79.99, 'B+'],
    [70, 'B+'],
    [60, 'B'],
    [50, 'C'],
    [40, 'D'],
    [39.99, 'F'],
    [0, 'F'],
  ])('gives %s%% a grade of %s', (percent, grade) => {
    expect(getGrade(percent, rowsFor('standard'))).toBe(grade);
  });

  it('works with other scales', () => {
    expect(getGrade(33, rowsFor('passFail'))).toBe('Pass');
    expect(getGrade(32.99, rowsFor('passFail'))).toBe('Fail');
    expect(getGrade(75, rowsFor('division'))).toBe('Distinction');
  });

  it('works whatever order the rows are in', () => {
    const rows = [{ label: 'Low', min: '0' }, { label: 'High', min: '50' }];
    expect(getGrade(60, rows)).toBe('High');
    expect(getGrade(40, rows)).toBe('Low');
  });
});

describe('validateScale', () => {
  it.each(Object.keys(GRADE_SCALES))('accepts the %s scale', (scale) => {
    expect(validateScale(rowsFor(scale)).isValid).toBe(true);
  });

  it('requires a grade with a minimum of 0', () => {
    const { isValid, missingZero } = validateScale([{ id: 1, label: 'A', min: '50' }]);
    expect(isValid).toBe(false);
    expect(missingZero).toBe(true);
  });

  it('rejects blank names, out-of-range and duplicate minimums', () => {
    const { rowErrors, isValid } = validateScale([
      { id: 1, label: '', min: '0' },
      { id: 2, label: 'B', min: '101' },
      { id: 3, label: 'C', min: '-1' },
      { id: 4, label: 'D', min: 'x' },
      { id: 5, label: 'E', min: '0' },
    ]);
    expect(isValid).toBe(false);
    expect(rowErrors[1].label).toBeTruthy();
    expect(rowErrors[2].min).toBeTruthy();
    expect(rowErrors[3].min).toBeTruthy();
    expect(rowErrors[4].min).toBeTruthy();
    expect(rowErrors[5].min).toBe('Each grade needs a different minimum.');
  });
});

describe('target marks', () => {
  const input = (target, obtained, maxSoFar, remaining) => ({ target, obtained, maxSoFar, remaining });

  it('calculates the marks needed', () => {
    const result = calculateTarget(input('75', '200', '250', '250'));
    expect(result.status).toBe('possible');
    expect(result.needed).toBe(175);
    expect(result.requiredTotal).toBe(375);
    expect(result.totalMax).toBe(500);
    expect(result.neededPercent).toBe(70);
    expect(result.maxPossiblePercent).toBe(90);
  });

  it('recognises a target that is already reached', () => {
    const result = calculateTarget(input('40', '200', '250', '250'));
    expect(result.status).toBe('achieved');
    expect(result.needed).toBe(0);
  });

  it('recognises an impossible target', () => {
    const result = calculateTarget(input('95', '200', '250', '250'));
    expect(result.status).toBe('impossible');
    expect(result.needed).toBe(275);
    expect(result.maxPossiblePercent).toBe(90);
  });

  it('treats needing exactly all remaining marks as possible', () => {
    const result = calculateTarget(input('90', '200', '250', '250'));
    expect(result.status).toBe('possible');
    expect(result.neededPercent).toBe(100);
  });

  it('handles no marks remaining', () => {
    expect(calculateTarget(input('50', '50', '100', '0')).status).toBe('achieved');
    const missed = calculateTarget(input('60', '50', '100', '0'));
    expect(missed.status).toBe('impossible');
    expect(missed.neededPercent).toBe(0);
  });

  it('handles nothing scored yet', () => {
    expect(calculateTarget(input('50', '0', '0', '200')).needed).toBe(100);
  });

  it('rounds required marks up, so the target is met', () => {
    expect(calculateTarget(input('33.33', '0', '0', '100')).needed).toBe(33.33);
    expect(calculateTarget(input('33.333', '0', '0', '100')).needed).toBe(33.34);
  });

  it('validates its inputs', () => {
    expect(validateTarget(input('75', '200', '250', '250'))).toEqual({});
    expect(validateTarget(input('101', '0', '0', '100')).target).toBeTruthy();
    expect(validateTarget(input('-1', '0', '0', '100')).target).toBeTruthy();
    expect(validateTarget(input('50', '300', '250', '250')).obtained).toBe('Obtained marks cannot exceed maximum marks.');
    expect(validateTarget(input('50', '-1', '250', '250')).obtained).toBe('Marks cannot be negative.');
    expect(validateTarget(input('50', '0', '-1', '250')).maxSoFar).toBe('Marks cannot be negative.');
    expect(validateTarget(input('50', '0', '0', '0')).remaining).toBe('Total maximum marks must be greater than zero.');
    expect(Object.keys(validateTarget(input('', '', '', '')))).toHaveLength(4);
  });
});

describe('copied text', () => {
  it('summarises subject results', () => {
    const text = buildSubjectsText(calculateSubjects(SUBJECTS), 'B+');
    expect(text).toContain('Total: 150 / 200');
    expect(text).toContain('Percentage: 75%');
    expect(text).toContain('Grade: B+');
    expect(text).toContain('Maths: 90 / 100 (90%)');
  });

  it('leaves out the grade when there is none', () => {
    expect(buildSubjectsText(calculateSubjects(SUBJECTS), null)).not.toContain('Grade');
    expect(buildOverallText(calculateOverall('450', '500'), null)).not.toContain('Grade');
  });

  it('summarises overall and target results', () => {
    expect(buildOverallText(calculateOverall('450', '500'), 'A+')).toContain('Marks lost: 50');
    expect(buildTargetText(calculateTarget({ target: '75', obtained: '200', maxSoFar: '250', remaining: '250' }), '75')).toContain(
      'Marks needed: 175 of 250 remaining',
    );
  });
});
