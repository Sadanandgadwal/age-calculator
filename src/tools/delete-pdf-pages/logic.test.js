import { describe, expect, it } from 'vitest';
import { checkDeletion, getFacts, remainingPages } from './logic.js';

describe('Delete PDF Pages', () => {
  it('keeps the other pages in order', () => expect(remainingPages(5, new Set([3, 0]))).toEqual([1, 2, 4]));
  it('needs a selection', () => expect(checkDeletion(5, new Set())).toMatch(/Select the pages/));
  it('keeps at least one page', () => expect(checkDeletion(2, new Set([0, 1]))).toMatch(/at least one page/));
  it('allows leaving one page', () => expect(checkDeletion(2, new Set([1]))).toBeNull());
  it('lists the facts', () =>
    expect(getFacts(new Set([4, 1, 2]), [0, 3], { size: 1024 })).toEqual([
      { label: 'Pages deleted', value: '2-3, 5' },
      { label: 'Pages left', value: '2' },
      { label: 'File size', value: '1 KB' },
    ]));
});
