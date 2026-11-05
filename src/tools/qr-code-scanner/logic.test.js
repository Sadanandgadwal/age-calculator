import { describe, expect, it } from 'vitest';
import { buildReport, checkFile, decodeFrame, describeCameraError, fitSize, readLink } from './logic.js';
import { createMatrix } from '../qr-code-generator/logic.js';

function frameFrom(text, { scale = 6, inverted = false } = {}) {
  const matrix = createMatrix(text, 'M');
  const quiet = 4;
  const width = (matrix.length + quiet * 2) * scale;
  const data = new Uint8ClampedArray(width * width * 4);
  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const row = Math.floor(y / scale) - quiet;
      const column = Math.floor(x / scale) - quiet;
      const isDark = Boolean(matrix[row]?.[column]);
      const value = isDark !== inverted ? 0 : 255;
      data.set([value, value, value, 255], (y * width + x) * 4);
    }
  }
  return { data, width, height: width };
}

describe('decodeFrame', () => {
  it('reads our own QR codes', () => {
    expect(decodeFrame(frameFrom('https://example.com/a?b=1'))).toBe('https://example.com/a?b=1');
  });

  it('reads light codes on dark backgrounds', () => {
    expect(decodeFrame(frameFrom('Hello', { inverted: true }))).toBe('Hello');
  });

  it('finds nothing in a blank frame', () => {
    expect(decodeFrame({ data: new Uint8ClampedArray(400 * 4).fill(255), width: 20, height: 20 })).toBeNull();
  });
});

describe('fitSize', () => {
  it('scales only large images, and keeps their shape', () => {
    expect(fitSize(4000, 2000)).toEqual({ width: 2000, height: 1000 });
    expect(fitSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe('checkFile', () => {
  it('accepts images', () => {
    expect(checkFile({ type: 'image/png', size: 100 })).toBeNull();
  });

  it('rejects other files and very large ones', () => {
    expect(checkFile({ type: 'application/pdf', size: 100 })).toContain('image file');
    expect(checkFile({ type: 'image/png', size: 26 * 1024 * 1024 })).toContain('25 MB');
  });
});

describe('readLink', () => {
  it.each([
    ['https://example.com', 'https://example.com/'],
    ['http://a.example/b', 'http://a.example/b'],
  ])('offers %s', (text, link) => {
    expect(readLink(text)).toBe(link);
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>1</script>', 'file:///etc/passwd', 'tel:+123', 'plain text', ''])('never offers %j as a link', (text) => {
    expect(readLink(text)).toBeNull();
  });
});

describe('describeCameraError', () => {
  it.each([
    ['NotAllowedError', 'blocked'],
    ['NotFoundError', 'No camera'],
    ['NotReadableError', 'another app'],
    ['Other', 'could not be started'],
  ])('explains %s', (name, message) => {
    expect(describeCameraError({ name })).toContain(message);
  });
});

describe('buildReport', () => {
  it('warns about links only', () => {
    expect(buildReport('https://example.com', 'Camera').notes[0]).toContain('Check the address');
    expect(buildReport('hello', 'Image')).toMatchObject({ notes: null, results: [{ label: 'Type', value: 'Text' }] });
  });
});
