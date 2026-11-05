import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, pickNames, readNames, validate } from './logic.js';

describe('readNames', () => {
  it('trims and skips blanks', () => {
    expect(readNames('  Asha \n\n Ben\n')).toEqual(['Asha', 'Ben']);
  });

  it('can merge repeats', () => {
    expect(readNames('Asha\nAsha\nBen')).toEqual(['Asha', 'Asha', 'Ben']);
    expect(readNames('Asha\nAsha\nBen', true)).toEqual(['Asha', 'Ben']);
    expect(readNames('Asha\nasha', true)).toEqual(['Asha', 'asha']);
  });
});

describe('validate', () => {
  it('accepts a good draw', () => {
    expect(validate({ text: 'A\nB', countText: '2', mergeRepeats: false })).toEqual({ errors: {}, names: ['A', 'B'], count: 2 });
  });

  it('needs names', () => {
    expect(validate({ text: ' \n ', countText: '1' }).errors.text).toBe('Please enter at least one name.');
  });

  it('checks the count against the list after merging', () => {
    expect(validate({ text: 'A\nA', countText: '2', mergeRepeats: true }).errors.count).toBe('The list only has 1 name.');
    expect(validate({ text: 'A\nB', countText: '3', mergeRepeats: true }).errors.count).toBe('The list only has 2 names.');
    expect(validate({ text: 'A', countText: '0', mergeRepeats: true }).errors.count).toBeTruthy();
  });
});

describe('pickNames', () => {
  it('takes the requested number with no repeats', () => {
    const winners = pickNames(['A', 'B', 'C', 'D'], 4);
    expect([...winners].sort()).toEqual(['A', 'B', 'C', 'D']);
    expect(pickNames(['A', 'B', 'C'], 2)).toHaveLength(2);
  });

  it('uses the mixing order', () => {
    expect(pickNames(['A', 'B'], 1, (names) => [...names].reverse())).toEqual(['B']);
  });

  it('gives each name a chance', () => {
    const seen = new Set();
    for (let run = 0; run < 200; run += 1) seen.add(pickNames(['A', 'B', 'C'], 1)[0]);
    expect(seen.size).toBe(3);
  });
});

describe('output', () => {
  it('shows one winner as the main result', () => {
    const report = buildReport({ winners: ['Asha'], total: 5 });
    expect(report.results[0]).toEqual({ label: 'Winner', value: 'Asha' });
    expect(report.text).toBeNull();
  });

  it('numbers many winners', () => {
    const result = { winners: ['Asha', 'Ben'], total: 5 };
    expect(buildResultText(result)).toBe('Asha\nBen');
    expect(buildReport(result).text.value).toBe('1. Asha\n2. Ben');
  });
});
