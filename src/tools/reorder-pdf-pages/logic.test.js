import { describe, expect, it } from 'vitest';
import { describeOrder, getFacts, initialOrder, isChanged, moveTo } from './logic.js';

describe('Reorder PDF Pages', () => {
  it('starts in order', () => expect(initialOrder(3)).toEqual([0, 1, 2]));
  it('moves a page later', () => expect(moveTo([0, 1, 2, 3], 0, 2)).toEqual([1, 2, 0, 3]));
  it('moves a page earlier', () => expect(moveTo([0, 1, 2, 3], 3, 1)).toEqual([0, 3, 1, 2]));
  it('ignores moves outside the list', () => {
    const order = [0, 1];
    expect(moveTo(order, 0, 5)).toBe(order);
    expect(moveTo(order, 1, 1)).toBe(order);
  });
  it('notices a change', () => {
    expect(isChanged([0, 1, 2])).toBe(false);
    expect(isChanged([1, 0, 2])).toBe(true);
  });
  it('describes the order', () => expect(describeOrder([2, 0, 1])).toBe('3, 1, 2'));
  it('shortens a long order', () => expect(describeOrder(initialOrder(25), 3)).toBe('1, 2, 3, …'));
  it('lists the facts', () =>
    expect(getFacts([1, 0], { size: 1024 })).toEqual([
      { label: 'New order', value: '2, 1' },
      { label: 'Pages', value: '2' },
      { label: 'File size', value: '1 KB' },
    ]));
});
