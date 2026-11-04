import { describe, expect, it } from 'vitest';
import { MODES, buildResultText, describeDayChange, evaluate, formatClock, formatDuration, getDurationTotals, parseClock, shiftClock, splitDuration } from './logic.js';

const d = (hours = '', minutes = '', seconds = '') => ({ hours, minutes, seconds });

describe('clock helpers', () => {
  it('parses valid times', () => {
    expect(parseClock('00:00')).toBe(0);
    expect(parseClock('23:59:59')).toBe(86399);
    expect(parseClock('14:30')).toBe(52200);
  });

  it.each(['', null, undefined, '24:00', '12:60', '1:00', 'abc', '12:00:60'])('rejects %s', (text) => {
    expect(parseClock(text)).toBeNull();
  });

  it.each([
    [0, '12:00 AM'],
    [3600, '1:00 AM'],
    [43200, '12:00 PM'],
    [46800, '1:00 PM'],
    [86399, '11:59:59 PM'],
    [52205, '2:30:05 PM'],
  ])('formats %s seconds as %s', (seconds, text) => {
    expect(formatClock(seconds)).toBe(text);
  });

  it('wraps around midnight in both directions', () => {
    expect(shiftClock(84600, 3600)).toEqual({ seconds: 1800, days: 1 });
    expect(shiftClock(1800, -3600)).toEqual({ seconds: 84600, days: -1 });
    expect(shiftClock(0, 86400 * 2)).toEqual({ seconds: 0, days: 2 });
    expect(shiftClock(0, -86400)).toEqual({ seconds: 0, days: -1 });
    expect(shiftClock(3600, 0)).toEqual({ seconds: 3600, days: 0 });
  });

  it('describes day changes', () => {
    expect(describeDayChange(0)).toBe('Same day');
    expect(describeDayChange(1)).toBe('1 day later');
    expect(describeDayChange(3)).toBe('3 days later');
    expect(describeDayChange(-1)).toBe('1 day earlier');
  });
});

describe('duration helpers', () => {
  it('splits seconds', () => {
    expect(splitDuration(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    expect(splitDuration(-3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it('formats with a sign and correct plurals', () => {
    expect(formatDuration(3661)).toBe('1 hour, 1 minute, 1 second');
    expect(formatDuration(7322)).toBe('2 hours, 2 minutes, 2 seconds');
    expect(formatDuration(-60)).toBe('−0 hours, 1 minute, 0 seconds');
  });
});

describe('adding and subtracting', () => {
  it('has all the modes', () => {
    expect(MODES.map(({ id }) => id)).toEqual(['add', 'subtract', 'between', 'after', 'before']);
  });

  it('adds with carrying', () => {
    const { result } = evaluate('add', { a: d('1', '45'), b: d('', '30') });
    expect(result).toMatchObject({ hours: 2, minutes: 15, seconds: 0, totalSeconds: 8100 });
  });

  it('carries seconds into minutes and hours', () => {
    expect(evaluate('add', { a: d('', '59', '59'), b: d('', '', '1') }).result).toMatchObject({ hours: 1, minutes: 0, seconds: 0 });
  });

  it('accepts entries above 59', () => {
    expect(evaluate('add', { a: d('', '90'), b: d('', '', '120') }).result).toMatchObject({ hours: 1, minutes: 32, seconds: 0 });
  });

  it('goes past 24 hours', () => {
    expect(evaluate('add', { a: d('20'), b: d('10') }).result.hours).toBe(30);
  });

  it('subtracts', () => {
    expect(evaluate('subtract', { a: d('2'), b: d('', '30') }).result).toMatchObject({ hours: 1, minutes: 30, totalSeconds: 5400 });
  });

  it('gives a negative result when needed', () => {
    const { result } = evaluate('subtract', { a: d('', '30'), b: d('1') });
    expect(result.totalSeconds).toBe(-1800);
    expect(formatDuration(result.totalSeconds)).toBe('−0 hours, 30 minutes, 0 seconds');
  });

  it('gives zero for equal times', () => {
    expect(evaluate('subtract', { a: d('1'), b: d('', '60') }).result.totalSeconds).toBe(0);
  });

  it('gives totals', () => {
    expect(getDurationTotals({ totalSeconds: 5400 })).toEqual([
      { label: 'Total Hours', value: '1.5' },
      { label: 'Total Minutes', value: '90' },
      { label: 'Total Seconds', value: '5,400' },
    ]);
  });
});

describe('time between', () => {
  it('counts within a day', () => {
    const { result } = evaluate('between', { start: '09:00', end: '17:30' });
    expect(result).toMatchObject({ hours: 8, minutes: 30, note: null });
  });

  it('treats an earlier end time as the next day, and says so', () => {
    const { result } = evaluate('between', { start: '22:00', end: '06:00' });
    expect(result.hours).toBe(8);
    expect(result.note).toMatch(/next day/);
  });

  it('gives zero for the same time', () => {
    expect(evaluate('between', { start: '10:00', end: '10:00' }).result.totalSeconds).toBe(0);
  });

  it('includes seconds', () => {
    expect(evaluate('between', { start: '10:00:15', end: '10:00:45' }).result.seconds).toBe(30);
  });

  it('requires both times', () => {
    expect(evaluate('between', { start: '', end: '' }).errors).toEqual({
      start: 'Please choose a start time.',
      end: 'Please choose an end time.',
    });
  });
});

describe('time after and before', () => {
  it('finds a later time', () => {
    expect(evaluate('after', { start: '09:00', a: d('2', '30') }).result).toMatchObject({ time: '11:30 AM', dayChange: 'Same day' });
  });

  it('crosses midnight forwards', () => {
    expect(evaluate('after', { start: '23:30', a: d('1') }).result).toMatchObject({ time: '12:30 AM', dayChange: '1 day later' });
  });

  it('finds an earlier time and crosses midnight backwards', () => {
    expect(evaluate('before', { start: '09:00', a: d('2') }).result).toMatchObject({ time: '7:00 AM', dayChange: 'Same day' });
    expect(evaluate('before', { start: '00:30', a: d('1') }).result).toMatchObject({ time: '11:30 PM', dayChange: '1 day earlier' });
  });

  it('handles several days', () => {
    expect(evaluate('after', { start: '12:00', a: d('48') }).result).toMatchObject({ time: '12:00 PM', dayChange: '2 days later' });
  });
});

describe('validation', () => {
  it('requires a value in each duration', () => {
    expect(evaluate('add', { a: d(), b: d() }).errors).toEqual({ aHours: 'Please enter a time.', bHours: 'Please enter a time.' });
    expect(evaluate('after', { start: '09:00', a: d() }).errors).toEqual({ aHours: 'Please enter a time.' });
  });

  it('accepts an explicit zero', () => {
    expect(evaluate('add', { a: d('0'), b: d('0') }).result.totalSeconds).toBe(0);
  });

  it('rejects negative, decimal and invalid parts', () => {
    expect(evaluate('add', { a: d('-1'), b: d('1') }).errors.aHours).toMatch(/0 or more/);
    expect(evaluate('add', { a: d('1.5'), b: d('1') }).errors.aHours).toBe('Please enter a whole number.');
    expect(evaluate('add', { a: d('', 'abc'), b: d('1') }).errors.aMinutes).toMatch(/valid number/);
    expect(evaluate('add', { a: d('1'), b: d('', '', '-5') }).errors.bSeconds).toMatch(/0 or more/);
  });

  it('rejects values that are too large', () => {
    expect(evaluate('add', { a: d('1000000001'), b: d('1') }).errors.aHours).toBe('This value is too large to calculate.');
  });

  it('requires a start time for clock modes', () => {
    expect(evaluate('after', { start: '', a: d('1') }).errors).toEqual({ start: 'Please choose a start time.' });
  });
});

describe('buildResultText', () => {
  it('summarises durations', () => {
    const text = buildResultText(evaluate('add', { a: d('1'), b: d('', '30') }).result);
    expect(text).toContain('Result: 1 hour, 30 minutes, 0 seconds');
    expect(text).toContain('Total Minutes: 90');
  });

  it('summarises clock results', () => {
    const text = buildResultText(evaluate('after', { start: '23:30', a: d('1') }).result);
    expect(text).toContain('Result: 12:30 AM');
    expect(text).toContain('Day: 1 day later');
  });
});
