import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

describe('Barcode Generator', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = () => ({ measureText: () => ({ width: 20 }) });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it('says when drawing fails, instead of blaming the value', () => {
    HTMLCanvasElement.prototype.getContext = () => null;
    expect(evaluate('ABC', 'CODE128').error).toBe('This barcode could not be drawn in this browser.');
  });

  it.each([
    ['CODE128', 'SKU-10482'],
    ['EAN13', '590123412345'],
    ['EAN13', '5901234123457'],
    ['UPC', '03600029145'],
    ['UPC', '036000291452'],
    ['CODE39', 'ABC-123'],
    ['ITF14', '1234567890123'],
  ])('%s accepts %s', (format, value) => {
    const { error, svg } = evaluate(value, format);
    expect(error).toBeNull();
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it.each([
    ['EAN13', '5901234123458'],
    ['EAN13', 'abc'],
    ['EAN13', '123'],
    ['UPC', '036000291453'],
    ['CODE39', 'abc'],
    ['ITF14', '123'],
    ['CODE128', '😀'],
  ])('%s rejects %s', (format, value) => {
    const { error, svg } = evaluate(value, format);
    expect(error).toContain('not a valid');
    expect(svg).toBeNull();
  });

  it('shows the check digit it worked out', () => {
    expect(evaluate('590123412345', 'EAN13').svg).toContain('5901234123457'.slice(1, 7));
  });

  it('has nothing for blank text', () => {
    expect(evaluate('  ', 'CODE128')).toEqual({ error: null, svg: null });
  });

  it('treats a value only as text in the drawing', () => {
    const attack = '<img src=x onerror=alert(1)>';
    const { svg } = evaluate(attack, 'CODE128');
    const holder = document.createElement('div');
    holder.innerHTML = svg;
    expect(holder.querySelector('img')).toBeNull();
    expect(holder.querySelector('text').textContent).toBe(attack);
  });

  it('builds the report', () => {
    const report = buildReport('ABC', 'CODE39', 'image');
    expect(report.inputs[1].value).toBe('Code 39');
    expect(report.visual).toBe('image');
  });
});
