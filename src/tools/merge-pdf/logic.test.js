import { describe, expect, it } from 'vitest';
import { describeFile, getFacts, orderKey } from './logic.js';

describe('Merge PDF output', () => {
  const items = [
    { id: 4, pageCount: 1, size: 1024 },
    { id: 2, pageCount: 5, size: 2048 },
  ];
  it('describes a file', () => {
    expect(describeFile(items[0])).toBe('1 page · 1 KB');
    expect(describeFile(items[1])).toBe('5 pages · 2 KB');
  });
  it('lists the facts', () =>
    expect(getFacts(items, { size: 3072 })).toEqual([
      { label: 'Files merged', value: '2' },
      { label: 'Total pages', value: '6' },
      { label: 'File size', value: '3 KB' },
    ]));
  it('keys the order', () => expect(orderKey(items)).toBe('4,2'));
});
