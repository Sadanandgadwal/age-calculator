import { describe, expect, it } from 'vitest';
import { buildReport, buildSvg, drawToCanvas, evaluate, getViewSize } from './logic.js';

describe('evaluate', () => {
  it('has nothing for empty text', () => {
    expect(evaluate('', 'M')).toEqual({ error: null, matrix: null });
  });

  it('creates a square code of a valid QR size', () => {
    const { matrix } = evaluate('https://example.com', 'M');
    expect(matrix.length).toBe(25);
    expect(matrix.every((row) => row.length === 25)).toBe(true);
  });

  it('draws the three position patterns', () => {
    const { matrix } = evaluate('Hello', 'L');
    const last = matrix.length - 1;
    for (const [row, column] of [[0, 0], [0, last], [last, 0]]) expect(matrix[row][column]).toBe(true);
    expect(matrix[last][last - 1]).toBeTypeOf('boolean');
  });

  it('needs a larger code for more error correction', () => {
    const text = 'x'.repeat(100);
    expect(evaluate(text, 'H').matrix.length).toBeGreaterThan(evaluate(text, 'L').matrix.length);
  });

  it('accepts non-English text', () => {
    expect(evaluate('नमस्ते 😀', 'M').matrix).toBeTruthy();
  });

  it('explains text that is too long, without throwing', () => {
    const { error, matrix } = evaluate('x'.repeat(3000), 'L');
    expect(error).toContain('too long');
    expect(matrix).toBeNull();
    expect(evaluate('x'.repeat(2000), 'L').matrix).toBeTruthy();
    expect(evaluate('x'.repeat(2000), 'H').error).toContain('too long');
  });
});

describe('output', () => {
  const { matrix } = evaluate('Hello', 'M');

  it('adds the quiet zone', () => {
    expect(getViewSize(matrix)).toBe(matrix.length + 8);
  });

  it('builds a standalone SVG', () => {
    const svg = buildSvg(matrix);
    expect(svg).toContain(`viewBox="0 0 ${matrix.length + 8} ${matrix.length + 8}"`);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('draws to a canvas at a scannable size', () => {
    const rects = [];
    const canvas = { getContext: () => ({ fillRect: (...args) => rects.push(args) }) };
    drawToCanvas(canvas, matrix);
    expect(canvas.width).toBe((matrix.length + 8) * 12);
    expect(rects[0]).toEqual([0, 0, canvas.width, canvas.width]);
  });

  it('builds the report', () => {
    const report = buildReport('Hello', 'H', matrix, 'image');
    expect(report.inputs[1].value).toBe('Highest (30%)');
    expect(report.visual).toBe('image');
  });
});
