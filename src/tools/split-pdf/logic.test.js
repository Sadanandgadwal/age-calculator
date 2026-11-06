import { describe, expect, it } from 'vitest';
import { describePlan, getFacts, partFilename, planSplit } from './logic.js';

describe('planSplit', () => {
  const plan = (mode, values) => planSplit(mode, { ranges: '', every: '', ...values }, 7);
  it('makes one file per range', () => expect(plan('ranges', { ranges: '1-3, 4-6, 7' }).parts).toEqual([[0, 1, 2], [3, 4, 5], [6]]));
  it('allows overlapping ranges', () => expect(plan('ranges', { ranges: '1-2, 2-3' }).parts).toEqual([[0, 1], [1, 2]]));
  it('supports open ranges', () => expect(plan('ranges', { ranges: '5-' }).parts).toEqual([[4, 5, 6]]));
  it('needs a range', () => expect(plan('ranges', { ranges: ' , ' }).error).toMatch(/at least one range/));
  it('passes on range errors', () => expect(plan('ranges', { ranges: '1-3, 9' }).error).toMatch(/Page 9 does not exist/));
  it('splits every N pages', () => expect(plan('every', { every: '3' }).parts).toEqual([[0, 1, 2], [3, 4, 5], [6]]));
  it('splits every page', () => expect(plan('each').parts).toHaveLength(7));
  it.each(['0', '8', '', '2.5', 'x'])('rejects every "%s"', (every) => expect(plan('every', { every }).error).toMatch(/1 to 7/));
});

describe('output', () => {
  it('names a single page', () => expect(partFilename('report.pdf', [4])).toBe('report-page-5.pdf'));
  it('names a range', () => expect(partFilename('report.pdf', [0, 1, 2])).toBe('report-pages-1-3.pdf'));
  it('describes the plan', () => {
    expect(describePlan([[0]])).toBe('1 file');
    expect(describePlan([[0], [1]])).toBe('2 files');
  });
  it('lists the facts', () => {
    expect(getFacts([[0, 1], [2]], { size: 2048 })).toEqual([
      { label: 'Files created', value: '2' },
      { label: 'Pages included', value: '3' },
      { label: 'ZIP size', value: '2 KB' },
    ]);
    expect(getFacts([[0]], { size: 10 })[2].label).toBe('PDF size');
  });
});
