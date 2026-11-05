import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, checkImageDimensions, checkImageFile, encodeCanvas, encodeKeepingFormat, flattensTransparency, formatBytes, formatName, keptFormat, outputFilename } from './imageFile.js';

const make = (name, type, size = 10) => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};
const fakeCanvas = (behaviour) => ({ toBlob: (done, type) => done(behaviour(type)) });

describe('checkImageFile', () => {
  it('accepts an image', () => expect(checkImageFile(make('a.png', 'image/png'))).toBeNull());
  it('rejects other files', () => expect(checkImageFile(make('a.pdf', 'application/pdf'))).toMatch(/image file/));
  it('rejects an empty file', () => expect(checkImageFile(make('a.png', 'image/png', 0))).toMatch(/empty/));
  it('rejects a file over the limit', () => expect(checkImageFile(make('a.png', 'image/png', MAX_IMAGE_BYTES + 1))).toMatch(/larger than 25 MB/));
  it('accepts a file exactly at the limit', () => expect(checkImageFile(make('a.png', 'image/png', MAX_IMAGE_BYTES))).toBeNull());
  it('honours a custom limit', () => expect(checkImageFile(make('a.png', 'image/png', 2048), 1024)).toMatch(/larger than 1 KB/));
  it('lets a HEIC file through so that browsers able to open it can', () => expect(checkImageFile(make('a.heic', ''))).toBeNull());
});

describe('checkImageDimensions', () => {
  it('accepts 40 megapixels', () => expect(checkImageDimensions(8000, 5000)).toBeNull());
  it('rejects more pixels', () => expect(checkImageDimensions(8001, 5000)).toMatch(/40 megapixels/));
  it('rejects a very long side', () => expect(checkImageDimensions(12001, 1)).toMatch(/40 megapixels/));
});

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [1023, '1023 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1048576, '1 MB'],
    [1572864, '1.5 MB'],
    [10485760, '10 MB'],
    [26214400, '25 MB'],
  ])('%i bytes is %s', (bytes, text) => expect(formatBytes(bytes)).toBe(text));
});

describe('outputFilename', () => {
  it('replaces the extension and adds the suffix', () => expect(outputFilename('holiday.photo.PNG', 'resized', 'image/jpeg')).toBe('holiday.photo-resized.jpg'));
  it('removes unsafe characters', () => expect(outputFilename('../a<b>:c.png', 'crop', 'image/png')).toBe('..abc-crop.png'));
  it('keeps letters from other languages', () => expect(outputFilename('फोटो.webp', 'crop', 'image/webp')).toBe('फोटो-crop.webp'));
  it('falls back when nothing remains', () => expect(outputFilename('<>.png', 'crop', 'image/png')).toBe('image-crop.png'));
});

describe('encoding', () => {
  it('returns the requested format', async () => {
    const blob = new Blob(['x'], { type: 'image/webp' });
    await expect(encodeCanvas(fakeCanvas(() => blob), 'image/webp', 0.5)).resolves.toBe(blob);
  });

  it('refuses a silent change of format', async () => {
    const canvas = fakeCanvas(() => new Blob(['x'], { type: 'image/png' }));
    await expect(encodeCanvas(canvas, 'image/webp')).rejects.toThrow(/cannot save WebP/);
  });

  it('reports a canvas that could not be saved', async () => {
    await expect(encodeCanvas(fakeCanvas(() => null), 'image/png')).rejects.toThrow(/could not be created/);
  });

  it('falls back to PNG when keeping an unsupported format', async () => {
    const blob = await encodeKeepingFormat(fakeCanvas(() => new Blob(['x'], { type: 'image/png' })), 'image/webp');
    expect(blob.type).toBe('image/png');
  });

  it('does not hide other failures when keeping a format', async () => {
    await expect(encodeKeepingFormat(fakeCanvas(() => null), 'image/png')).rejects.toThrow(/could not be created/);
  });

  it('keeps web formats and turns others into PNG', () => {
    expect(keptFormat('image/jpeg')).toBe('image/jpeg');
    expect(keptFormat('image/gif')).toBe('image/png');
    expect(keptFormat('image/svg+xml')).toBe('image/png');
  });

  it('knows when transparency is lost', () => {
    expect(flattensTransparency('image/png', 'image/jpeg')).toBe(true);
    expect(flattensTransparency('image/jpeg', 'image/jpeg')).toBe(false);
    expect(flattensTransparency('image/png', 'image/webp')).toBe(false);
  });

  it('names formats', () => {
    expect(formatName('image/svg+xml')).toBe('SVG');
    expect(formatName('image/unknown')).toBe('Image');
  });
});
