import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, describeTarget, describeWeights, evaluate } from './logic.js';

const rows = (...items) => items.map(([score, weight, name = ''], index) => ({ id: index + 1, name, score, weight }));

describe('weighted score', () => {
  it('weights each score', () => {
    expect(evaluate(rows(['90', '50'], ['80', '50']), '').result).toMatchObject({ percent: 85, totalWeight: 100, remainingWeight: 0 });
  });

  it('works on part of a course', () => {
    expect(evaluate(rows(['80', '20'], ['70', '30']), '').result).toMatchObject({ percent: 74, totalWeight: 50, remainingWeight: 50 });
  });

  it('skips blank rows and names items', () => {
    const { result } = evaluate([{ id: 1, name: '', score: '', weight: '' }, { id: 2, name: ' Exam ', score: '60', weight: '40' }], '');
    expect(result.items).toEqual([{ name: 'Exam', score: 60, weight: 40 }]);
  });
});

describe('target', () => {
  it('works out the score needed', () => {
    const { result } = evaluate(rows(['80', '20'], ['70', '30']), '75');
    expect(result.needed).toBe(76);
    expect(describeTarget(result)).toBe('You need 76% on the remaining 50% to finish with 75%.');
  });

  it('explains impossible, reached and finished cases', () => {
    expect(describeTarget(evaluate(rows(['50', '60']), '95').result)).toBe('You would need 162.5% on the remaining 40%, which is not possible.');
    expect(describeTarget(evaluate(rows(['100', '90']), '50').result)).toBe('You have already reached 50%, even with 0% on the remaining 10%.');
    expect(describeTarget(evaluate(rows(['80', '100']), '90').result)).toBe('Your weights already add up to 100% or more, so there is nothing left to score.');
    expect(describeTarget(evaluate(rows(['80', '100']), '').result)).toBeNull();
  });
});

describe('weights note', () => {
  it('describes totals other than 100%', () => {
    expect(describeWeights(100)).toBeNull();
    expect(describeWeights(50)).toBe('Your weights add up to 50%, so this is your score on the work done so far.');
    expect(describeWeights(120)).toBe('Your weights add up to 120%, so each weight was scaled down to fit 100%.');
  });
});

describe('validation', () => {
  it('needs at least one item', () => {
    expect(evaluate(rows(['', '']), '').errors).toEqual({ 1: { score: 'Please enter at least one score and its weight.' } });
  });

  it('checks scores, weights and the target', () => {
    expect(evaluate(rows(['101', '0']), '').errors[1]).toEqual({ score: 'The score must be between 0 and 100.', weight: 'The weight must be greater than 0.' });
    expect(evaluate(rows(['80', '']), '').errors[1]).toEqual({ weight: 'Please enter the weight.' });
    expect(evaluate(rows(['80', '50']), '120').errors.target).toBe('The target must be between 0 and 100.');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const { result } = evaluate(rows(['80', '20', 'Quiz'], ['70', '30']), '75');
    expect(buildResultText(result, 'B+')).toBe('Weighted score: 74%\nGrade: B+\nTotal weight: 50%\nQuiz: 80% × 20%\nItem 2: 70% × 30%\nYou need 76% on the remaining 50% to finish with 75%.\nYour weights add up to 50%, so this is your score on the work done so far.');
    const report = buildReport(result, 'B+');
    expect(report.inputs[0]).toEqual({ label: '1. Quiz', value: '80%, weight 20%' });
    expect(report.results).toEqual([{ label: 'Weighted score', value: '74%' }, { label: 'Grade', value: 'B+' }]);
    expect(report.notes).toHaveLength(2);
    expect(buildReport(result, null).results).toHaveLength(1);
  });
});
