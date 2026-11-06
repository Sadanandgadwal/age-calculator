import { describe, expect, it } from 'vitest';
import { getFacts, sortedPages } from './logic.js';

describe('Extract PDF Pages', () => {
  it('keeps the original order', () => expect(sortedPages(new Set([4, 0, 2]))).toEqual([0, 2, 4]));
  it('lists the facts', () =>
    expect(getFacts([0, 1, 2, 5], 8, { size: 2048 })).toEqual([
      { label: 'Pages extracted', value: '4 of 8' },
      { label: 'Pages', value: '1-3, 6' },
      { label: 'File size', value: '2 KB' },
    ]));
});
