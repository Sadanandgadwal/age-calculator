import { describe, expect, it } from 'vitest';
import { addLap, buildResultText, formatStopwatch } from './logic.js';

describe('formatStopwatch', () => {
  it.each([
    [0, '00:00:00.00'],
    [9, '00:00:00.00'],
    [10, '00:00:00.01'],
    [1234, '00:00:01.23'],
    [59999, '00:00:59.99'],
    [60000, '00:01:00.00'],
    [3600000, '01:00:00.00'],
    [3905670, '01:05:05.67'],
    [360000000, '100:00:00.00'],
  ])('formats %s ms as %s', (ms, text) => {
    expect(formatStopwatch(ms)).toBe(text);
  });

  it('never shows negative time', () => {
    expect(formatStopwatch(-5)).toBe('00:00:00.00');
  });
});

describe('addLap', () => {
  it('records lap and total times, newest first', () => {
    const one = addLap([], 90000);
    expect(one).toEqual([{ number: 1, lapMs: 90000, totalMs: 90000 }]);

    const two = addLap(one, 190000);
    expect(two).toEqual([
      { number: 2, lapMs: 100000, totalMs: 190000 },
      { number: 1, lapMs: 90000, totalMs: 90000 },
    ]);
  });

  it('does not change the existing list', () => {
    const laps = addLap([], 1000);
    addLap(laps, 2000);
    expect(laps).toHaveLength(1);
  });
});

describe('buildResultText', () => {
  it('gives the elapsed time, then laps in order', () => {
    expect(buildResultText(4000, addLap(addLap([], 1000), 3000))).toBe('Elapsed time: 00:00:04.00\nLap 1: 00:00:01.00 (total 00:00:01.00)\nLap 2: 00:00:02.00 (total 00:00:03.00)');
    expect(buildResultText(1500, [])).toBe('Elapsed time: 00:00:01.50');
  });
});
