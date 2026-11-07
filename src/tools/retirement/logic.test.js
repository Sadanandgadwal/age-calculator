import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, corpusNeeded, describeCovered, evaluate } from './logic.js';

const base = { age: '30', retireAge: '60', lifeAge: '85', expenses: '50000', inflation: '6', preReturn: '12', postReturn: '7', savings: '500000' };
const result = (values) => evaluate({ ...base, ...values }).result;
const errors = (values) => evaluate({ ...base, ...values }).errors;

describe('corpusNeeded', () => {
  it('pays level expenses with no growth', () => {
    expect(corpusNeeded(3000000, 240, 0, 0)).toBe(720000000);
  });

  it('needs less when returns beat inflation', () => {
    expect(corpusNeeded(100, 120, 8, 4)).toBeLessThan(12000);
    expect(corpusNeeded(100, 120, 4, 8)).toBeGreaterThan(12000);
  });
});

describe('retirement plan', () => {
  it('works out the money needed and monthly saving', () => {
    const value = result({});
    expect(Math.round(value.expenseAtRetirement)).toBe(28717456);
    expect(Math.round(value.corpus / 100)).toBe(74885443);
    expect(Math.ceil(value.monthly)).toBe(1628361);
    expect(value).toMatchObject({ yearsToRetire: 30, retirementYears: 25 });
  });

  it('works without growth', () => {
    expect(result({ age: '40', retireAge: '60', lifeAge: '80', expenses: '30000', inflation: '0', preReturn: '0', postReturn: '0', savings: '' })).toMatchObject({ corpus: 720000000, monthly: 3000000 });
  });

  it('says when savings already cover retirement', () => {
    const value = result({ age: '50', retireAge: '55', lifeAge: '60', expenses: '1000', savings: '10000000' });
    expect(value.monthly).toBe(0);
    expect(describeCovered(value)).toBe('Your current savings are expected to cover your retirement, so you do not need to save more.');
  });
});

describe('validation', () => {
  it('checks the ages are in order', () => {
    expect(errors({ retireAge: '30' }).retireAge).toBe('Your retirement age must be more than your current age.');
    expect(errors({ lifeAge: '60' }).lifeAge).toBe('This age must be more than your retirement age.');
    expect(errors({ age: '30.5' }).age).toBe('Please enter a whole number.');
  });

  it('checks the amounts and rates', () => {
    expect(errors({ expenses: '', inflation: '21', savings: '-1' })).toEqual({
      expenses: 'Please enter your monthly expenses.',
      inflation: 'Please enter a rate from 0 to 20%.',
      savings: "Savings can't be negative.",
    });
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const value = result({});
    expect(buildResultText(value).split('\n').slice(0, 2)).toEqual(['Money needed at retirement: ₹7,48,85,443.07', 'Save each month: ₹16,283.61']);
    const report = buildReport(value);
    expect(report.inputs).toHaveLength(8);
    expect(report.results).toHaveLength(3);
    expect(report.notes).toHaveLength(1);
  });
});
