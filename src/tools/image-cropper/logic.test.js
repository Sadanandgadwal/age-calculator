import { describe, expect, it } from 'vitest';
import { cropKey, getFacts, getNote } from './logic.js';

describe('Image Cropper output', () => {
  const source = { width: 400, height: 300, type: 'image/jpeg' };
  const crop = { x: 10, y: 20, width: 100, height: 50 };

  it('lists the facts', () =>
    expect(getFacts(source, crop, { size: 2048, type: 'image/jpeg' })).toEqual([
      { label: 'Cropped size', value: '100 × 50 px' },
      { label: 'Position', value: '10, 20 px from the top left' },
      { label: 'Original', value: '400 × 300 px' },
      { label: 'File', value: '2 KB, JPEG' },
    ]));
  it('has no note when the format is kept', () => expect(getNote(source, 'image/jpeg')).toBeNull());
  it('explains a format change', () => expect(getNote({ ...source, type: 'image/gif' }, 'image/png')).toMatch(/GIF cannot be saved here/));
  it('keys a crop', () => expect(cropKey(crop)).toBe('10,20,100,50'));
});
