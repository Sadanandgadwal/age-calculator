import { describe, expect, it } from 'vitest';
import {
  addMonths,
  daysInMonth,
  formatDate,
  getTodayIso,
  isLeapYear,
  parseDate,
  toIsoDate,
} from './date.js';

describe('parseDate', () => {
  it('parses a valid date', () => {
    expect(parseDate('1998-06-15')).toEqual({ year: 1998, month: 6, day: 15 });
  });

  it.each(['', null, undefined, 'abc', '1998-6-15', '15-06-1998'])('rejects bad format: %s', (value) => {
    expect(parseDate(value)).toBeNull();
  });

  it.each(['2023-02-29', '2023-04-31', '2023-13-01', '2023-00-10', '2023-01-00', '0199-01-01'])(
    'rejects impossible or out-of-range date: %s',
    (value) => {
      expect(parseDate(value)).toBeNull();
    },
  );

  it('accepts 29 Feb only in a leap year', () => {
    expect(parseDate('2024-02-29')).not.toBeNull();
    expect(parseDate('1900-02-29')).toBeNull();
  });
});

describe('isLeapYear', () => {
  it('follows the Gregorian rules', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe('daysInMonth', () => {
  it('returns the correct month lengths', () => {
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 4)).toBe(30);
    expect(daysInMonth(2023, 12)).toBe(31);
  });
});

describe('addMonths', () => {
  it('clamps to the end of a shorter month', () => {
    expect(toIsoDate(addMonths({ year: 2023, month: 1, day: 31 }, 1))).toBe('2023-02-28');
  });

  it('crosses year boundaries', () => {
    expect(toIsoDate(addMonths({ year: 2023, month: 12, day: 15 }, 1))).toBe('2024-01-15');
    expect(toIsoDate(addMonths({ year: 2023, month: 1, day: 15 }, 24))).toBe('2025-01-15');
  });
});

describe('getTodayIso', () => {
  it('uses the local date rather than the UTC date', () => {
    // Built from local parts, so it is 23:30 on 3 Nov in whichever zone runs the test.
    expect(getTodayIso(new Date(2026, 10, 3, 23, 30))).toBe('2026-11-03');
    expect(getTodayIso(new Date(2026, 10, 3, 0, 30))).toBe('2026-11-03');
  });
});

describe('formatDate', () => {
  it('formats dates without shifting them across time zones', () => {
    expect(formatDate({ year: 1998, month: 6, day: 15 })).toBe('15 Jun 1998');
    expect(formatDate({ year: 2027, month: 1, day: 1 })).toBe('1 Jan 2027');
  });
});
