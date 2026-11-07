import { describe, expect, it } from 'vitest';
import { applyTurn, countTurned, getFacts, normalizeAngle } from './logic.js';

describe('Rotate PDF', () => {
  it.each([
    [0, 0],
    [90, 90],
    [360, 0],
    [450, 90],
    [-90, 270],
    [-450, 270],
  ])('normalizes %i to %i', (input, output) => expect(normalizeAngle(input)).toBe(output));

  it('turns only the selected pages', () => expect(applyTurn([0, 0, 0], new Set([0, 2]), 90, 3)).toEqual([90, 0, 90]));
  it('adds to earlier turns', () => expect(applyTurn([90, 0], new Set([0, 1]), 270, 2)).toEqual([0, 270]));
  it('fills missing turns', () => expect(applyTurn([], new Set([1]), 180, 2)).toEqual([0, 180]));
  it('counts turned pages', () => expect(countTurned([0, 90, 180, 0])).toBe(2));
  it('lists the facts', () =>
    expect(getFacts([90, 0, 270], { size: 1024 })).toEqual([
      { label: 'Pages rotated', value: '2 of 3' },
      { label: 'File size', value: '1 KB' },
    ]));
});
