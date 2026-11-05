import { describe, expect, it } from 'vitest';
import { addDays, dayOfYear, daysInYear, fromDayNumber, isoWeek, isoWeeksInYear, weekdayIndex } from './calendar.js';
import { parseDate, toDayNumber, toIsoDate } from './date.js';

const d = parseDate;

describe('weekdayIndex', () => {
  it.each([
    ['1970-01-01', 4],
    ['2026-11-03', 2],
    ['2000-01-01', 6],
    ['2024-02-29', 4],
    ['1900-01-01', 1],
    ['1000-01-01', 3],
    ['9999-12-31', 5],
  ])('%s is day %s', (date, index) => {
    expect(weekdayIndex(d(date))).toBe(index);
  });

  it('matches the built-in calendar', () => {
    for (let n = -200000; n < 200000; n += 997) {
      const date = fromDayNumber(n);
      expect(weekdayIndex(date)).toBe(new Date(n * 86400000).getUTCDay());
    }
  });
});

describe('date arithmetic', () => {
  it('adds days across month, year and leap boundaries', () => {
    expect(toIsoDate(addDays(d('2024-02-28'), 1))).toBe('2024-02-29');
    expect(toIsoDate(addDays(d('2023-02-28'), 1))).toBe('2023-03-01');
    expect(toIsoDate(addDays(d('2025-12-31'), 1))).toBe('2026-01-01');
    expect(toIsoDate(addDays(d('2026-01-01'), -1))).toBe('2025-12-31');
  });

  it('round-trips day numbers', () => {
    expect(fromDayNumber(toDayNumber(d('1998-06-15')))).toEqual(d('1998-06-15'));
  });

  it('finds the day of the year', () => {
    expect(dayOfYear(d('2026-01-01'))).toBe(1);
    expect(dayOfYear(d('2026-12-31'))).toBe(365);
    expect(dayOfYear(d('2024-12-31'))).toBe(366);
    expect(dayOfYear(d('2024-03-01'))).toBe(61);
    expect(dayOfYear(d('2023-03-01'))).toBe(60);
  });

  it('knows the days in a year', () => {
    expect(daysInYear(2024)).toBe(366);
    expect(daysInYear(2023)).toBe(365);
    expect(daysInYear(1900)).toBe(365);
    expect(daysInYear(2000)).toBe(366);
  });
});

describe('isoWeek', () => {
  it.each([
    ['2026-11-03', 45, 2026, '2026-11-02', '2026-11-08'],
    ['2026-01-01', 1, 2026, '2025-12-29', '2026-01-04'],
    ['2025-12-29', 1, 2026, '2025-12-29', '2026-01-04'],
    ['2021-01-01', 53, 2020, '2020-12-28', '2021-01-03'],
    ['2021-01-03', 53, 2020, '2020-12-28', '2021-01-03'],
    ['2021-01-04', 1, 2021, '2021-01-04', '2021-01-10'],
    ['2020-12-31', 53, 2020, '2020-12-28', '2021-01-03'],
    ['2024-12-30', 1, 2025, '2024-12-30', '2025-01-05'],
    ['2023-01-01', 52, 2022, '2022-12-26', '2023-01-01'],
    ['2023-01-02', 1, 2023, '2023-01-02', '2023-01-08'],
    ['2026-12-31', 53, 2026, '2026-12-28', '2027-01-03'],
    ['2024-02-29', 9, 2024, '2024-02-26', '2024-03-03'],
  ])('%s is week %s of %s', (date, week, year, start, end) => {
    const result = isoWeek(d(date));
    expect(result.week).toBe(week);
    expect(result.year).toBe(year);
    expect(toIsoDate(result.start)).toBe(start);
    expect(toIsoDate(result.end)).toBe(end);
  });

  it('always runs Monday to Sunday', () => {
    for (let n = 0; n < 800; n += 1) {
      const { start, end } = isoWeek(fromDayNumber(19000 + n));
      expect(weekdayIndex(start)).toBe(1);
      expect(weekdayIndex(end)).toBe(0);
    }
  });

  it('knows how many weeks a year has', () => {
    expect(isoWeeksInYear(2020)).toBe(53);
    expect(isoWeeksInYear(2026)).toBe(53);
    expect(isoWeeksInYear(2021)).toBe(52);
    expect(isoWeeksInYear(2024)).toBe(52);
  });
});
