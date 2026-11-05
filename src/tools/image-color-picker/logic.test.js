import { describe, expect, it } from 'vitest';
import { buildReport, describeColor, findMainColors, fitScale, getColorFacts, getText, movePoint, pointFromEvent, toHex, toHsl } from './logic.js';

const color = (r, g, b, a = 255) => ({ r, g, b, a });

describe('toHex', () => {
  it('pads and capitalizes', () => expect(toHex(color(1, 171, 255))).toBe('#01ABFF'));
  it('handles black', () => expect(toHex(color(0, 0, 0))).toBe('#000000'));
});

describe('toHsl', () => {
  it.each([
    [color(255, 0, 0), { h: 0, s: 100, l: 50 }],
    [color(0, 255, 0), { h: 120, s: 100, l: 50 }],
    [color(0, 0, 255), { h: 240, s: 100, l: 50 }],
    [color(255, 255, 0), { h: 60, s: 100, l: 50 }],
    [color(255, 0, 255), { h: 300, s: 100, l: 50 }],
    [color(255, 255, 255), { h: 0, s: 0, l: 100 }],
    [color(0, 0, 0), { h: 0, s: 0, l: 0 }],
    [color(128, 128, 128), { h: 0, s: 0, l: 50 }],
    [color(22, 105, 122), { h: 190, s: 69, l: 28 }],
    [color(255, 0, 1), { h: 360 % 360, s: 100, l: 50 }],
  ])('converts %o', (input, expected) => expect(toHsl(input)).toEqual(expected));
});

describe('describeColor', () => {
  it('gives all forms', () => expect(describeColor(color(255, 0, 0))).toEqual({ hex: '#FF0000', rgb: 'rgb(255, 0, 0)', hsl: 'hsl(0, 100%, 50%)', opacity: 100 }));
  it('hides opacity when solid', () => expect(getColorFacts(color(1, 2, 3)).map((fact) => fact.label)).toEqual(['HEX', 'RGB', 'HSL']));
  it('shows opacity when not solid', () => expect(getColorFacts(color(1, 2, 3, 128)).at(-1)).toEqual({ label: 'Opacity', value: '50%' }));
});

describe('findMainColors', () => {
  const pixels = (...items) => Uint8ClampedArray.from(items.flat());

  it('orders colors by how much they cover', () => {
    const result = findMainColors(pixels([255, 0, 0, 255], [255, 0, 0, 255], [255, 0, 0, 255], [0, 0, 255, 255]));
    expect(result.map(toHex)).toEqual(['#FF0000', '#0000FF']);
    expect(result.map((item) => item.share)).toEqual([75, 25]);
  });

  it('averages similar colors', () => expect(toHex(findMainColors(pixels([240, 0, 0, 255], [250, 0, 0, 255]))[0])).toBe('#F50000'));
  it('skips transparent pixels', () => expect(findMainColors(pixels([255, 0, 0, 0], [0, 255, 0, 255])).map(toHex)).toEqual(['#00FF00']));
  it('returns nothing for a fully transparent image', () => expect(findMainColors(pixels([1, 2, 3, 0]))).toEqual([]));
  it('limits how many are returned', () => expect(findMainColors(pixels([255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]), 2)).toHaveLength(2));
});

describe('pointFromEvent', () => {
  const rect = { left: 10, top: 20, width: 100, height: 50 };
  it('maps a click to a pixel', () => expect(pointFromEvent({ clientX: 60, clientY: 45 }, rect, 400, 200)).toEqual({ x: 200, y: 100 }));
  it('stays inside at the far edge', () => expect(pointFromEvent({ clientX: 110, clientY: 70 }, rect, 400, 200)).toEqual({ x: 399, y: 199 }));
  it('stays inside before the start', () => expect(pointFromEvent({ clientX: 0, clientY: 0 }, rect, 400, 200)).toEqual({ x: 0, y: 0 }));
});

describe('movePoint', () => {
  it('moves by one percent', () => expect(movePoint({ x: 100, y: 100 }, 'ArrowRight', 400, 200, false)).toEqual({ x: 104, y: 100 }));
  it('moves one pixel with Shift', () => expect(movePoint({ x: 100, y: 100 }, 'ArrowUp', 400, 200, true)).toEqual({ x: 100, y: 99 }));
  it('moves at least one pixel on small images', () => expect(movePoint({ x: 1, y: 1 }, 'ArrowDown', 10, 10, false)).toEqual({ x: 1, y: 2 }));
  it('stops at the edges', () => {
    expect(movePoint({ x: 0, y: 0 }, 'ArrowLeft', 400, 200, false)).toEqual({ x: 0, y: 0 });
    expect(movePoint({ x: 399, y: 199 }, 'ArrowDown', 400, 200, false)).toEqual({ x: 399, y: 199 });
  });
  it('ignores other keys', () => expect(movePoint({ x: 0, y: 0 }, 'Enter', 400, 200, false)).toBeNull());
});

it('scales only images over the limit', () => {
  expect(fitScale(1000, 500)).toBe(1);
  expect(fitScale(8192, 100)).toBe(0.5);
});

describe('output', () => {
  const palette = [{ ...color(255, 0, 0), share: 60 }];
  it('writes the text', () => expect(getText(color(255, 0, 0), palette)).toBe('HEX: #FF0000\nRGB: rgb(255, 0, 0)\nHSL: hsl(0, 100%, 50%)\nMain colors: #FF0000'));
  it('leaves out an empty palette', () => expect(getText(color(0, 0, 0), [])).not.toContain('Main colors'));
  it('builds the report', () => {
    const report = buildReport(color(255, 0, 0), palette, 'a.png');
    expect(report.inputs).toEqual([{ label: 'Image', value: 'a.png' }]);
    expect(report.results[0]).toEqual({ label: 'HEX', value: '#FF0000' });
    expect(report.details).toEqual([{ label: 'Main color 1', value: '#FF0000 (60%)' }]);
  });
});
