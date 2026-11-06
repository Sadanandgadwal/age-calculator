import { describe, expect, it } from 'vitest';
import { getFacts, getNote, linkedSize, validateSize } from './logic.js';

const source = { width: 3000, height: 2000, size: 2048, type: 'image/jpeg' };

describe('linkedSize', () => {
  it('keeps proportions', () => expect(linkedSize('600', 2000, 3000)).toBe('400'));
  it('rounds to a whole pixel', () => expect(linkedSize('100', 2000, 3000)).toBe('67'));
  it('never gives zero', () => expect(linkedSize('1', 1, 3000)).toBe('1'));
  it('stays empty when the entry is not usable', () => {
    expect(linkedSize('', 2000, 3000)).toBe('');
    expect(linkedSize('abc', 2000, 3000)).toBe('');
    expect(linkedSize('0', 2000, 3000)).toBe('');
  });
});

describe('validateSize', () => {
  const pixels = (width, height) => validateSize(source, { modeId: 'pixels', width, height, percent: '' });
  const percent = (value) => validateSize(source, { modeId: 'percent', width: '', height: '', percent: value });

  it('accepts pixels', () => expect(pixels('600', '400').size).toEqual({ width: 600, height: 400 }));
  it('trims spaces', () => expect(pixels(' 600 ', ' 400 ').size).toEqual({ width: 600, height: 400 }));
  it.each(['', '0', '-5', '1.5', 'abc', '1e3'])('rejects a width of "%s"', (value) => {
    const result = pixels(value, '400');
    expect(result.size).toBeUndefined();
    expect(result.errors.width).toMatch(/whole number/);
  });
  it('rejects a missing height', () => expect(pixels('600', '').errors.height).toMatch(/whole number/));
  it('accepts the side limit', () => expect(pixels('12000', '100').size).toBeDefined());
  it('rejects over the side limit', () => expect(pixels('12001', '100').errors.width).toMatch(/too large/));
  it('accepts 40 megapixels', () => expect(pixels('8000', '5000').size).toBeDefined());
  it('rejects over 40 megapixels', () => expect(pixels('8001', '5000').errors.width).toMatch(/too large/));

  it('scales by percent', () => expect(percent('50').size).toEqual({ width: 1500, height: 1000 }));
  it('rounds percent results', () => expect(validateSize({ ...source, width: 3, height: 3 }, { modeId: 'percent', percent: '50' }).size).toEqual({ width: 2, height: 2 }));
  it('never scales below one pixel', () => expect(validateSize({ ...source, width: 10, height: 1 }, { modeId: 'percent', percent: '1' }).size).toEqual({ width: 1, height: 1 }));
  it.each(['', '0', '401', '12.5', 'x'])('rejects a percent of "%s"', (value) => expect(percent(value).errors.percent).toMatch(/1 to 400/));
  it('reports when a percent is too large', () => expect(percent('400').errors.percent).toMatch(/too large/));
});

describe('output', () => {
  const size = { width: 600, height: 400 };

  it('lists the facts', () =>
    expect(getFacts(source, size, { size: 1024 }, 'image/jpeg')).toEqual([
      { label: 'Original', value: '3000 × 2000 px, 2 KB' },
      { label: 'Resized', value: '600 × 400 px, 1 KB' },
      { label: 'Format', value: 'JPEG' },
    ]));

  it('has no note for a normal resize', () => expect(getNote(source, size, 'image/jpeg')).toBeNull());
  it('warns when enlarging', () => expect(getNote(source, { width: 6000, height: 4000 }, 'image/jpeg')).toMatch(/cannot add detail/));
  it('warns when stretching', () => expect(getNote(source, { width: 600, height: 600 }, 'image/jpeg')).toMatch(/stretched/));
  it('explains a format change', () => expect(getNote({ ...source, type: 'image/gif' }, size, 'image/png')).toMatch(/GIF cannot be saved here/));
  it('explains a WebP fallback', () => expect(getNote({ ...source, type: 'image/webp' }, size, 'image/png')).toMatch(/WebP cannot be saved here/));
  it('warns about lost transparency', () => expect(getNote({ ...source, type: 'image/png' }, size, 'image/jpeg')).toMatch(/Transparent/));
});
