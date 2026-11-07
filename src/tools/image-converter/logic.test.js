import { describe, expect, it } from 'vitest';
import { MAX_FILES, canEncode, convertedName, describeResult, getFormat, pickFiles, transparencyNote, uniqueNames } from './logic.js';

const image = (name, type = 'image/png', size = 1000) => new File([new Uint8Array(size)], name, { type });

describe('formats and names', () => {
  it('names the output after the original', () => {
    expect(convertedName('Holiday photo.png', 'image/webp')).toBe('Holiday photo-converted.webp');
    expect(convertedName('scan.heic', 'image/jpeg')).toBe('scan-converted.jpg');
    expect(convertedName('a.png', 'image/avif')).toBe('a-converted.avif');
    expect(getFormat('nope').id).toBe('image/png');
  });

  it('keeps names unique for the ZIP', () => {
    expect(uniqueNames(['a.jpg', 'a.jpg', 'b.jpg', 'a.jpg'])).toEqual(['a.jpg', 'a-2.jpg', 'b.jpg', 'a-3.jpg']);
  });
});

describe('pickFiles', () => {
  it('accepts images and explains the rest', () => {
    const { accepted, problems } = pickFiles([], [image('a.png'), new File(['x'], 'notes.txt', { type: 'text/plain' }), image('empty.png', 'image/png', 0)]);
    expect(accepted.map(({ name }) => name)).toEqual(['a.png']);
    expect(problems).toEqual(['notes.txt: Please choose an image file, such as a PNG or JPG.', 'empty.png: This file is empty. Please choose another image.']);
  });

  it('limits the number of images', () => {
    const current = Array.from({ length: MAX_FILES - 1 }, (_, index) => ({ id: index }));
    const { accepted, problems } = pickFiles(current, [image('a.png'), image('b.png')]);
    expect(accepted).toHaveLength(1);
    expect(problems).toEqual(['b.png: You can convert up to 20 images at a time.']);
  });
});

describe('results', () => {
  it('describes a conversion', () => {
    expect(describeResult({ type: 'image/png', size: 2048, width: 400, height: 300, blob: { type: 'image/webp', size: 1024 } })).toBe('PNG 2 KB → WebP 1 KB (50% smaller), 400 × 300 px');
    expect(describeResult({ type: 'image/jpeg', size: 1000, width: 1, height: 1, blob: { type: 'image/png', size: 1500 } })).toContain('50% larger');
  });

  it('notes lost transparency only for JPEG', () => {
    expect(transparencyNote([{ type: 'image/png' }], 'image/jpeg')).toBe('JPEG has no transparency, so any transparent areas are filled with white.');
    expect(transparencyNote([{ type: 'image/jpeg' }], 'image/jpeg')).toBeNull();
    expect(transparencyNote([{ type: 'image/png' }], 'image/webp')).toBeNull();
  });

  it('reports no encoder where canvas is missing', async () => {
    expect(await canEncode('image/avif')).toBe(false);
  });
});
