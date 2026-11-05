import { describe, expect, it } from 'vitest';
import { buildResultText, evaluate, formatDifference, formatOffset, offsetMs, resolveLocalTime } from './logic.js';
import { ALL_ZONES } from './zones.js';
import { toDayNumber } from '../../utils/date.js';

const HOUR = 3600000;
const IST = 'Asia/Kolkata';
const NY = 'America/New_York';
const LA = 'America/Los_Angeles';
const LONDON = 'Europe/London';
const DUBAI = 'Asia/Dubai';
const run = (date, time, from, to) => evaluate({ date, time, from, to }).result;
const wall = (year, month, day, hour, minute = 0) => toDayNumber({ year, month, day }) * 86400000 + hour * HOUR + minute * 60000;

describe('zones', () => {
  it('are all valid and unique, including the required ones', () => {
    expect(new Set(ALL_ZONES.map(({ id }) => id)).size).toBe(ALL_ZONES.length);
    for (const { id } of ALL_ZONES) expect(() => offsetMs(0, id), id).not.toThrow();
    for (const id of [IST, NY, LA, DUBAI, 'UTC', 'Etc/GMT']) expect(ALL_ZONES.some((zone) => zone.id === id), id).toBe(true);
    expect(ALL_ZONES.length).toBeGreaterThanOrEqual(40);
  });
});

describe('offsets', () => {
  it.each([
    [IST, 2026, 1, 5.5],
    [IST, 2026, 7, 5.5],
    [DUBAI, 2026, 1, 4],
    ['UTC', 2026, 7, 0],
    ['Etc/GMT', 2026, 7, 0],
    [NY, 2026, 1, -5],
    [NY, 2026, 7, -4],
    [LA, 2026, 1, -8],
    [LA, 2026, 7, -7],
    [LONDON, 2026, 1, 0],
    [LONDON, 2026, 7, 1],
    ['Asia/Kathmandu', 2026, 7, 5.75],
    ['Australia/Sydney', 2026, 1, 11],
    ['Australia/Sydney', 2026, 7, 10],
  ])('%s in %s-%s is UTC %s', (zone, year, month, hours) => {
    expect(offsetMs(Date.UTC(year, month - 1, 15, 12), zone)).toBe(hours * HOUR);
  });

  it('formats offsets', () => {
    expect(formatOffset(5.5 * HOUR)).toBe('UTC+05:30');
    expect(formatOffset(-5 * HOUR)).toBe('UTC−05:00');
    expect(formatOffset(0)).toBe('UTC+00:00');
    expect(formatOffset(5.75 * HOUR)).toBe('UTC+05:45');
  });
});

describe('conversion', () => {
  it('converts in winter', () => {
    const result = run('2026-01-15', '12:00', IST, NY);
    expect(result.target).toMatchObject({ time: '1:30 AM', dateText: 'Thursday, 15 Jan 2026', offset: 'UTC−05:00', name: 'Eastern Standard Time' });
    expect(result.source).toMatchObject({ time: '12:00 PM', offset: 'UTC+05:30', name: 'India Standard Time' });
    expect(result.dayChange).toBe('Same day');
    expect(result.difference).toBe('10 hours 30 minutes behind');
  });

  it('accounts for daylight saving in summer', () => {
    const result = run('2026-07-15', '12:00', IST, NY);
    expect(result.target).toMatchObject({ time: '2:30 AM', offset: 'UTC−04:00', name: 'Eastern Daylight Time' });
    expect(result.difference).toBe('9 hours 30 minutes behind');
  });

  it('shows the converted date when it changes', () => {
    expect(run('2026-01-15', '06:00', IST, NY).target.dateText).toBe('Wednesday, 14 Jan 2026');
    expect(run('2026-01-15', '06:00', IST, NY).dayChange).toBe('Previous day');
    expect(run('2026-01-15', '22:00', NY, IST).target.dateText).toBe('Friday, 16 Jan 2026');
    expect(run('2026-01-15', '22:00', NY, IST).dayChange).toBe('Next day');
  });

  it('crosses a year boundary', () => {
    expect(run('2025-12-31', '20:00', NY, 'UTC').target).toMatchObject({ time: '1:00 AM', dateText: 'Thursday, 1 Jan 2026' });
  });

  it('handles other required zones', () => {
    expect(run('2026-01-15', '12:00', IST, DUBAI).target.time).toBe('10:30 AM');
    expect(run('2026-01-15', '12:00', 'UTC', IST).target.time).toBe('5:30 PM');
    expect(run('2026-01-15', '12:00', 'Etc/GMT', LA).target.time).toBe('4:00 AM');
    expect(run('2026-07-15', '12:00', LONDON, 'UTC').target.time).toBe('11:00 AM');
  });

  it('keeps the same time when both zones match', () => {
    const result = run('2026-01-15', '12:00', IST, IST);
    expect(result.target.time).toBe('12:00 PM');
    expect(result.difference).toBe('Same time');
  });

  it('keeps seconds', () => {
    expect(run('2026-01-15', '12:00:30', 'UTC', IST).target.time).toBe('5:30:30 PM');
  });

  it('round-trips', () => {
    const there = run('2026-07-15', '12:00', IST, NY).target.time;
    expect(there).toBe('2:30 AM');
    expect(run('2026-07-15', '02:30', NY, IST).target.time).toBe('12:00 PM');
  });

  it('formats differences', () => {
    expect(formatDifference(HOUR)).toBe('1 hour ahead');
    expect(formatDifference(-30 * 60000)).toBe('30 minutes behind');
    expect(formatDifference(0)).toBe('Same time');
  });
});

describe('clock changes', () => {
  it('moves a skipped time forward and says so', () => {
    expect(resolveLocalTime(wall(2026, 3, 8, 2, 30), NY)).toEqual({ utcMs: Date.UTC(2026, 2, 8, 7, 30), status: 'skipped' });
    const result = run('2026-03-08', '02:30', NY, NY);
    expect(result.target.time).toBe('3:30 AM');
    expect(result.note).toMatch(/skipped/);
  });

  it('uses the first of a repeated time and says so', () => {
    expect(resolveLocalTime(wall(2026, 11, 1, 1, 30), NY)).toEqual({ utcMs: Date.UTC(2026, 10, 1, 5, 30), status: 'repeated' });
    const result = run('2026-11-01', '01:30', NY, 'UTC');
    expect(result.target.time).toBe('5:30 AM');
    expect(result.note).toMatch(/twice/);
  });

  it('adds no note on ordinary times', () => {
    expect(run('2026-11-01', '12:00', NY, 'UTC').note).toBeNull();
    expect(resolveLocalTime(wall(2026, 1, 15, 12), IST).status).toBe('exact');
  });

  it('handles the changeover day either side of the change', () => {
    expect(run('2026-03-08', '01:59', NY, 'UTC').target.time).toBe('6:59 AM');
    expect(run('2026-03-08', '03:00', NY, 'UTC').target.time).toBe('7:00 AM');
  });
});

describe('validation', () => {
  it('requires a date and time', () => {
    expect(evaluate({ date: '', time: '', from: IST, to: NY }).errors).toEqual({ date: 'Please choose a date.', time: 'Please choose a time.' });
  });

  it('rejects invalid and out-of-range values', () => {
    expect(evaluate({ date: '2023-02-29', time: '12:00', from: IST, to: NY }).errors.date).toBe('Please enter a real date.');
    expect(evaluate({ date: '1899-12-31', time: '12:00', from: IST, to: NY }).errors.date).toMatch(/1900 to 2100/);
    expect(evaluate({ date: '2101-01-01', time: '12:00', from: IST, to: NY }).errors.date).toMatch(/1900 to 2100/);
    expect(evaluate({ date: '2026-01-01', time: '25:00', from: IST, to: NY }).errors.time).toBe('Please enter a valid time.');
  });
});

describe('buildResultText', () => {
  it('summarises the conversion', () => {
    const text = buildResultText(run('2026-01-15', '12:00', IST, NY));
    expect(text).toContain('From: 12:00 PM, Thursday, 15 Jan 2026');
    expect(text).toContain('To: 1:30 AM, Thursday, 15 Jan 2026');
    expect(text).toContain('UTC−05:00');
  });
});
