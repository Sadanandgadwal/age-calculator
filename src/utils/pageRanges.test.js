import { describe, expect, it } from 'vitest';
import { formatPageRanges, groupsOf, parsePageRanges } from './pageRanges.js';

describe('parsePageRanges', () => {
  it.each([
    ['1', [0]],
    ['1-3', [0, 1, 2]],
    ['1-3, 5', [0, 1, 2, 4]],
    [' 2 - 4 ,6', [1, 2, 3, 5]],
    ['8-', [7, 8, 9]],
    ['-2', [0, 1]],
    ['5, 1-2', [4, 0, 1]],
    ['1-3, 2-4', [0, 1, 2, 3]],
    ['3-3', [2]],
    ['1,,2,', [0, 1]],
    ['10', [9]],
  ])('reads "%s"', (text, pages) => expect(parsePageRanges(text, 10)).toEqual({ pages }));

  it.each([
    ['', /enter the pages/],
    [' , ', /enter the pages/],
    ['0', /start at 1/],
    ['0-2', /start at 1/],
    ['4-2', /first page is after the last/],
    ['11', /Page 11 does not exist. This PDF has 10 pages/],
    ['9-12', /Page 12 does not exist/],
    ['a', /not a page or range/],
    ['1.5', /not a page or range/],
    ['1-2-3', /not a page or range/],
    ['-', /not a page or range/],
    ['2 3', /not a page or range/],
  ])('rejects "%s"', (text, message) => expect(parsePageRanges(text, 10).error).toMatch(message));

  it('says page for a single page', () => expect(parsePageRanges('2', 1).error).toMatch(/has 1 page\./));
});

describe('formatPageRanges', () => {
  it('joins runs', () => expect(formatPageRanges([0, 1, 2, 4, 6, 7])).toBe('1-3, 5, 7-8'));
  it('sorts and removes repeats', () => expect(formatPageRanges([4, 0, 0, 1])).toBe('1-2, 5'));
  it('is empty for no pages', () => expect(formatPageRanges([])).toBe(''));
});

describe('groupsOf', () => {
  it('splits evenly', () => expect(groupsOf(4, 2)).toEqual([[0, 1], [2, 3]]));
  it('keeps a short last group', () => expect(groupsOf(5, 2)).toEqual([[0, 1], [2, 3], [4]]));
  it('makes one group when the size is large', () => expect(groupsOf(3, 10)).toEqual([[0, 1, 2]]));
  it('makes nothing for no pages', () => expect(groupsOf(0, 2)).toEqual([]));
});
