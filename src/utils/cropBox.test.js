import { describe, expect, it } from 'vitest';
import { MIN_CROP, cropFromKey, initialCrop, moveCrop, resizeCrop } from './cropBox.js';

const inside = (crop, width, height) => crop.x >= 0 && crop.y >= 0 && crop.x + crop.width <= width && crop.y + crop.height <= height;

describe('initialCrop', () => {
  it('covers 80% and is centered', () => expect(initialCrop(1000, 500)).toEqual({ x: 100, y: 50, width: 800, height: 400 }));
  it('fits a square in a wide image', () => expect(initialCrop(1000, 500, 1)).toEqual({ x: 300, y: 50, width: 400, height: 400 }));
  it('fits a wide ratio in a tall image', () => expect(initialCrop(500, 1000, 16 / 9)).toEqual({ x: 50, y: 388, width: 400, height: 225 }));
  it('works on a one-pixel image', () => expect(initialCrop(1, 1, 1)).toEqual({ x: 0, y: 0, width: 1, height: 1 }));
});

describe('moveCrop', () => {
  const crop = { x: 100, y: 100, width: 200, height: 100 };
  it('moves', () => expect(moveCrop(crop, 10, -20, 1000, 500)).toEqual({ x: 110, y: 80, width: 200, height: 100 }));
  it('stops at the top left', () => expect(moveCrop(crop, -500, -500, 1000, 500)).toEqual({ x: 0, y: 0, width: 200, height: 100 }));
  it('stops at the bottom right', () => expect(moveCrop(crop, 5000, 5000, 1000, 500)).toEqual({ x: 800, y: 400, width: 200, height: 100 }));
});

describe('resizeCrop', () => {
  const crop = { x: 100, y: 100, width: 200, height: 100 };

  it('grows from the bottom right', () => expect(resizeCrop(crop, 'se', 50, 20, 1000, 500)).toEqual({ x: 100, y: 100, width: 250, height: 120 }));
  it('grows from the top left, keeping the opposite corner', () => expect(resizeCrop(crop, 'nw', -50, -20, 1000, 500)).toEqual({ x: 50, y: 80, width: 250, height: 120 }));
  it('grows from the top right', () => expect(resizeCrop(crop, 'ne', 50, -20, 1000, 500)).toEqual({ x: 100, y: 80, width: 250, height: 120 }));
  it('grows from the bottom left', () => expect(resizeCrop(crop, 'sw', -50, 20, 1000, 500)).toEqual({ x: 50, y: 100, width: 250, height: 120 }));
  it('stops at the image edge', () => expect(resizeCrop(crop, 'se', 5000, 5000, 1000, 500)).toEqual({ x: 100, y: 100, width: 900, height: 400 }));
  it('stops at the top left edge', () => expect(resizeCrop(crop, 'nw', -5000, -5000, 1000, 500)).toEqual({ x: 0, y: 0, width: 300, height: 200 }));
  it('never flips or shrinks below the minimum', () => expect(resizeCrop(crop, 'se', -5000, -5000, 1000, 500)).toEqual({ x: 100, y: 100, width: MIN_CROP, height: MIN_CROP }));
  it('keeps a ratio', () => expect(resizeCrop({ x: 0, y: 0, width: 100, height: 100 }, 'se', 60, 0, 1000, 500, 1)).toEqual({ x: 0, y: 0, width: 160, height: 160 }));
  it('keeps a ratio at the edge', () => {
    const result = resizeCrop({ x: 0, y: 0, width: 160, height: 90 }, 'se', 5000, 5000, 1000, 500, 16 / 9);
    expect(result).toEqual({ x: 0, y: 0, width: 889, height: 500 });
    expect(inside(result, 1000, 500)).toBe(true);
  });
  it('keeps a tall ratio from the top left', () => {
    const result = resizeCrop({ x: 400, y: 200, width: 90, height: 160 }, 'nw', -5000, -5000, 1000, 500, 9 / 16);
    expect(inside(result, 1000, 500)).toBe(true);
    expect(result.x + result.width).toBe(490);
    expect(result.y + result.height).toBe(360);
    expect(Math.abs(result.width / result.height - 9 / 16)).toBeLessThan(0.01);
  });
  it('stays inside a tiny image', () => {
    const result = resizeCrop({ x: 0, y: 0, width: 4, height: 4 }, 'se', -10, -10, 4, 4, 1);
    expect(inside(result, 4, 4)).toBe(true);
    expect(result.width).toBeGreaterThan(0);
  });
  it('stays inside for random drags', () => {
    let seed = 3;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let index = 0; index < 500; index += 1) {
      const handle = ['nw', 'ne', 'sw', 'se'][index % 4];
      const ratio = [null, 1, 16 / 9, 9 / 16][index % 4];
      const start = initialCrop(640, 480, ratio, 0.3 + random() * 0.6);
      const result = resizeCrop(start, handle, (random() - 0.5) * 2000, (random() - 0.5) * 2000, 640, 480, ratio);
      expect(inside(result, 640, 480)).toBe(true);
      expect(result.width).toBeGreaterThanOrEqual(1);
      expect(result.height).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('cropFromKey', () => {
  const crop = { x: 100, y: 100, width: 200, height: 100 };
  it('moves with the arrows', () => expect(cropFromKey(crop, 'ArrowRight', false, 1000, 500)).toEqual({ ...crop, x: 110 }));
  it('resizes with Shift', () => expect(cropFromKey(crop, 'ArrowDown', true, 1000, 500)).toEqual({ ...crop, height: 110 }));
  it('resizes with a ratio', () => expect(cropFromKey({ x: 0, y: 0, width: 100, height: 100 }, 'ArrowDown', true, 1000, 500, 1)).toEqual({ x: 0, y: 0, width: 110, height: 110 }));
  it('ignores other keys', () => expect(cropFromKey(crop, 'Tab', false, 1000, 500)).toBeNull());
});
