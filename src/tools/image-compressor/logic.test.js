import { describe, expect, it } from 'vitest';
import { describeSaving, getFacts, getNote } from './logic.js';

const source = { size: 2048, type: 'image/png', width: 10, height: 5 };

describe('describeSaving', () => {
  it('reports a saving', () => expect(describeSaving(2048, 1024)).toEqual({ isSmaller: true, value: '1 KB (50%)' }));
  it('shows small savings with a decimal', () => expect(describeSaving(2000, 1995)).toEqual({ isSmaller: true, value: '5 B (0.3%)' }));
  it('never calls a larger file a saving', () => expect(describeSaving(1024, 2048)).toEqual({ isSmaller: false, value: '1 KB larger' }));
  it('does not call an equal file a saving', () => expect(describeSaving(1024, 1024).isSmaller).toBe(false));
});

describe('getFacts', () => {
  it('lists a saving', () => {
    expect(getFacts(source, { size: 1024 }, 'image/webp')).toEqual([
      { label: 'Original', value: '2 KB, PNG' },
      { label: 'Compressed', value: '1 KB, WebP' },
      { label: 'Saved', value: '1 KB (50%)' },
      { label: 'Dimensions', value: '10 × 5 px' },
    ]);
  });
  it('lists an increase', () => expect(getFacts(source, { size: 4096 }, 'image/jpeg')[2]).toEqual({ label: 'Change', value: '2 KB larger' }));
});

describe('getNote', () => {
  it('warns when the result is larger', () => expect(getNote(source, { size: 4096 }, 'image/webp')).toMatch(/not smaller/));
  it('warns when equal', () => expect(getNote(source, { size: 2048 }, 'image/webp')).toMatch(/not smaller/));
  it('warns about transparency in JPEG', () => expect(getNote(source, { size: 10 }, 'image/jpeg')).toMatch(/transparent/));
  it('does not warn when WebP keeps transparency', () => expect(getNote(source, { size: 10 }, 'image/webp')).toBeNull());
  it('does not warn about a JPEG source', () => expect(getNote({ ...source, type: 'image/jpeg' }, { size: 10 }, 'image/jpeg')).toBeNull());
  it('warns that GIF animation is lost', () => expect(getNote({ ...source, type: 'image/gif' }, { size: 10 }, 'image/webp')).toMatch(/first frame/));
});
