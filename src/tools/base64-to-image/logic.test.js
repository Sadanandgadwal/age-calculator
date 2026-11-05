import { describe, expect, it } from 'vitest';
import { detectImageType, getFacts, parseImageText } from './logic.js';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYPj/HwADAgH/h0Bh2AAAAABJRU5ErkJggg==';
const bytesOf = (...values) => Uint8Array.from(values);
const text = (value) => new TextEncoder().encode(value);

describe('detectImageType', () => {
  it.each([
    ['PNG', bytesOf(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), 'image/png'],
    ['JPEG', bytesOf(0xff, 0xd8, 0xff, 0xe0), 'image/jpeg'],
    ['GIF87a', text('GIF87a...'), 'image/gif'],
    ['GIF89a', text('GIF89a...'), 'image/gif'],
    ['WebP', text('RIFF1234WEBPVP8 '), 'image/webp'],
    ['BMP', text('BM00000000000000'), 'image/bmp'],
    ['ICO', bytesOf(0, 0, 1, 0, 1, 0, 16), 'image/x-icon'],
    ['AVIF', text('0000ftypavif'), 'image/avif'],
    ['SVG', text('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'image/svg+xml'],
    ['SVG with a prologue', text('<?xml version="1.0"?>\n<!-- logo -->\n<!DOCTYPE svg PUBLIC "x" "y">\n<svg>'), 'image/svg+xml'],
  ])('finds %s', (_, bytes, type) => expect(detectImageType(bytes)).toBe(type));

  it.each([
    ['plain text', text('hello world')],
    ['HTML', text('<html><svg></svg></html>')],
    ['a word starting with svg', text('<svgfoo>')],
    ['RIFF that is not WebP', text('RIFF1234WAVEfmt ')],
    ['a PDF', text('%PDF-1.7')],
    ['a cut-off PNG signature', bytesOf(0x89, 0x50)],
  ])('rejects %s', (_, bytes) => expect(detectImageType(bytes)).toBeNull());
});

describe('parseImageText', () => {
  it('reads plain Base64', () => {
    const parsed = parseImageText(PNG);
    expect(parsed.type).toBe('image/png');
    expect(parsed.extension).toBe('png');
    expect(parsed.declaredMismatch).toBe(false);
  });

  it('reads a data URI', () => expect(parseImageText(`data:image/png;base64,${PNG}`).type).toBe('image/png'));
  it('reads a data URI with parameters', () => expect(parseImageText(`data:image/png;charset=utf-8;base64,${PNG}`).type).toBe('image/png'));
  it('ignores line breaks and spaces', () => expect(parseImageText(`  ${PNG.slice(0, 20)}\n${PNG.slice(20)} `).type).toBe('image/png'));
  it('reads URL-safe Base64', () => expect(parseImageText(btoa('\xff\xd8\xff\xe0').replace(/\+/g, '-').replace(/\//g, '_')).type).toBe('image/jpeg'));
  it('notices a wrong label', () => expect(parseImageText(`data:image/jpeg;base64,${PNG}`).declaredMismatch).toBe(true));
  it('accepts image/jpg as a label for JPEG', () => expect(parseImageText(`data:image/jpg;base64,${btoa('\xff\xd8\xff\xe0')}`).declaredMismatch).toBe(false));
  it('rejects a data URI that is not Base64', () => expect(parseImageText('data:image/svg+xml,<svg></svg>').error).toMatch(/not Base64/));
  it('rejects a data URI with no comma', () => expect(parseImageText('data:image/png;base64').error).toMatch(/not complete/));
  it('rejects a data URI with no data', () => expect(parseImageText('data:image/png;base64,').error).toMatch(/no image data/));
  it('rejects invalid characters', () => expect(parseImageText('not base64 !!').error).toMatch(/not valid Base64/));
  it('rejects data that is not an image', () => expect(parseImageText(btoa('hello world')).error).toMatch(/not a supported image/));
  it('asks for text when empty', () => expect(parseImageText('   ').error).toMatch(/paste/));
  it('rejects text over the limit', () => expect(parseImageText('A'.repeat(20_000_001)).error).toMatch(/too long/));
});

describe('getFacts', () => {
  const parsed = { type: 'image/png', bytes: new Uint8Array(2048) };
  it('lists the size once known', () =>
    expect(getFacts(parsed, { width: 4, height: 2 })).toEqual([
      { label: 'Format', value: 'PNG' },
      { label: 'Dimensions', value: '4 × 2 px' },
      { label: 'File size', value: '2 KB' },
    ]));
  it('works before the size is known', () => expect(getFacts(parsed, null)).toHaveLength(2));
});
