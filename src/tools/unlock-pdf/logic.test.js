import { describe, expect, it } from 'vitest';
import { describeSource, getFacts } from './logic.js';

describe('Unlock PDF', () => {
  it('describes the file', () => expect(describeSource({ name: 'a.pdf', pageCount: 1 })).toBe('a.pdf: 1 page, password protected'));
  it('lists the facts', () =>
    expect(getFacts(3, { size: 2048 })).toEqual([
      { label: 'Password', value: 'Removed' },
      { label: 'Pages', value: '3' },
      { label: 'File size', value: '2 KB' },
    ]));
});
