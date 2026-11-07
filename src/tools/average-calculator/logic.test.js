import { describe as group, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, describeMode, evaluate, median, modes, parseList } from './logic.js';

const result = (mode, numbers, weights) => evaluate(mode, numbers, weights).result;
const errors = (mode, numbers, weights) => evaluate(mode, numbers, weights).errors;

group('parseList', () => {
  it('accepts commas, spaces, semicolons and new lines', () => {
    expect(parseList('1, 2;3\n4\t5  -6.5').values).toEqual([1, 2, 3, 4, 5, -6.5]);
  });

  it('names the first value that is not a number', () => {
    expect(parseList('1, two, 3').error).toBe('"two" is not a number. Separate numbers with commas, spaces or new lines.');
    expect(parseList('  ').error).toBe('Please enter some numbers.');
    expect(parseList('1e999').error).toMatch(/is not a number/);
    expect(parseList('9999999999999999').error).toBe('One of the numbers is too large to calculate.');
  });

  it('limits the list size', () => {
    expect(parseList('1 '.repeat(10001)).error).toBe('Please enter no more than 10,000 numbers.');
  });
});

group('statistics', () => {
  it('finds the median for odd and even counts', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('finds one or more modes', () => {
    expect(modes([3, 7, 7, 2])).toEqual({ values: [7], count: 2 });
    expect(modes([1, 1, 2, 2, 3])).toEqual({ values: [1, 2], count: 2 });
    expect(modes([1, 2, 3])).toEqual({ values: [], count: 1 });
  });

  it('describes the mode', () => {
    expect(describeMode({ values: [7], count: 2 })).toBe('7 (2 times)');
    expect(describeMode({ values: [1, 2], count: 3 })).toBe('1; 2 (3 times each)');
    expect(describeMode({ values: [], count: 1 })).toBe('None, every number appears once');
  });
});

group('simple average', () => {
  it('works out every statistic', () => {
    expect(result('simple', '3, 7, 7, 2, 9')).toMatchObject({ count: 5, sum: 28, mean: 5.6, median: 7, min: 2, max: 9, range: 7 });
  });

  it('handles one number and negatives', () => {
    expect(result('simple', '42')).toMatchObject({ mean: 42, median: 42, range: 0 });
    expect(result('simple', '-4 4')).toMatchObject({ mean: 0, range: 8 });
  });
});

group('weighted average', () => {
  it('weights each number', () => {
    expect(result('weighted', '80, 60', '3, 1')).toMatchObject({ weighted: 75, mean: 70, totalWeight: 4 });
  });

  it('needs one weight per number', () => {
    expect(errors('weighted', '1 2 3', '1 2').weights).toBe('Enter one weight for each number. You have 3 numbers and 2 weights.');
  });

  it('rejects negative and zero weights', () => {
    expect(errors('weighted', '1 2', '1 -1').weights).toBe("Weights can't be negative.");
    expect(errors('weighted', '1 2', '0 0').weights).toBe('The weights must add up to more than 0.');
  });

  it('reports both missing lists', () => {
    expect(errors('weighted', '', '')).toEqual({ numbers: 'Please enter some numbers.', weights: 'Please enter some weights.' });
  });
});

group('results', () => {
  it('builds the text and report', () => {
    const simple = result('simple', '70 85 90 75');
    expect(buildResultText(simple)).toContain('Average (mean): 80');
    const report = buildReport(MODES[0], '70 85 90 75', '', simple);
    expect(report.inputs).toEqual([{ label: 'Numbers', value: '70, 85, 90, 75' }]);
    expect(report.results).toEqual([{ label: 'Average (mean)', value: '80' }]);
    expect(report.details.map(({ label }) => label)).toContain('Median');
  });

  it('shortens a long list in the report', () => {
    const numbers = Array.from({ length: 40 }, (_, index) => index + 1).join(' ');
    expect(buildReport(MODES[0], numbers, '', result('simple', numbers)).inputs[0].value).toMatch(/30 and 10 more$/);
  });

  it('includes the weights in a weighted report', () => {
    const report = buildReport(MODES[1], '80 60', '3 1', result('weighted', '80 60', '3 1'));
    expect(report.inputs[1]).toEqual({ label: 'Weights', value: '3, 1' });
    expect(report.results[0]).toEqual({ label: 'Weighted average', value: '75' });
  });
});
