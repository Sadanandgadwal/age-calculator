import { describe, expect, it } from 'vitest';
import { calculateAge } from './age.js';
import { toIsoDate } from './date.js';

const ymd = (result) => [result.years, result.months, result.days];

describe('calculateAge', () => {
  describe('normal calculation', () => {
    it('calculates the exact age from the reference design dates', () => {
      expect(ymd(calculateAge('1998-06-15', '2026-11-03'))).toEqual([28, 4, 19]);
    });

    it('calculates totals from real calendar days', () => {
      const result = calculateAge('1998-06-15', '2026-11-03');
      // 28 years = 10,220 days + 7 leap days (2000-2024), then 141 days from 15 Jun to 3 Nov.
      expect(result.totalDays).toBe(10368);
      expect(result.totalWeeks).toBe(1481);
      expect(result.totalMonths).toBe(340);
    });

    it('finds the weekday of birth', () => {
      expect(calculateAge('1998-06-15', '2026-11-03').bornOnWeekday).toBe('Monday');
      expect(calculateAge('2000-01-01', '2026-11-03').bornOnWeekday).toBe('Saturday');
    });

    it('does not count a birthday until it arrives', () => {
      expect(ymd(calculateAge('2000-06-15', '2026-06-14'))).toEqual([25, 11, 30]);
      expect(ymd(calculateAge('2000-06-15', '2026-06-15'))).toEqual([26, 0, 0]);
    });
  });

  describe('same-day birth date', () => {
    it('returns zero for every age value', () => {
      const result = calculateAge('2026-11-03', '2026-11-03');
      expect(ymd(result)).toEqual([0, 0, 0]);
      expect(result.totalDays).toBe(0);
      expect(result.totalWeeks).toBe(0);
      expect(result.totalMonths).toBe(0);
    });

    it('treats the first birthday as the next one, not the day of birth', () => {
      const { nextBirthday } = calculateAge('2026-11-03', '2026-11-03');
      expect(toIsoDate(nextBirthday.date)).toBe('2027-11-03');
      expect(nextBirthday.daysUntil).toBe(365);
      expect(nextBirthday.turning).toBe(1);
      expect(nextBirthday.isToday).toBe(false);
    });
  });

  describe('leap years', () => {
    it('counts the leap day in totals', () => {
      expect(calculateAge('2024-02-28', '2024-03-01').totalDays).toBe(2);
      expect(calculateAge('2023-02-28', '2023-03-01').totalDays).toBe(1);
    });

    it('counts a full leap year as 366 days', () => {
      expect(calculateAge('2024-01-01', '2025-01-01').totalDays).toBe(366);
    });

    it('applies the century rule', () => {
      expect(calculateAge('1900-02-28', '1900-03-01').totalDays).toBe(1);
      expect(calculateAge('2000-02-28', '2000-03-01').totalDays).toBe(2);
    });
  });

  describe('29 February birthdays', () => {
    it('reaches a whole year on 28 Feb in a common year', () => {
      expect(ymd(calculateAge('2000-02-29', '2001-02-27'))).toEqual([0, 11, 29]);
      expect(ymd(calculateAge('2000-02-29', '2001-02-28'))).toEqual([1, 0, 0]);
      expect(ymd(calculateAge('2000-02-29', '2001-03-01'))).toEqual([1, 0, 1]);
    });

    it('reaches a whole year on 29 Feb in a leap year', () => {
      expect(ymd(calculateAge('2000-02-29', '2024-02-28'))).toEqual([23, 11, 30]);
      expect(ymd(calculateAge('2000-02-29', '2024-02-29'))).toEqual([24, 0, 0]);
    });

    it('observes the next birthday on 28 Feb in a common year', () => {
      const { nextBirthday } = calculateAge('2000-02-29', '2026-11-03');
      expect(toIsoDate(nextBirthday.date)).toBe('2027-02-28');
      expect(nextBirthday.isObservedOnFeb28).toBe(true);
      expect(nextBirthday.turning).toBe(27);
    });

    it('uses the real 29 Feb when the next birthday is in a leap year', () => {
      const { nextBirthday } = calculateAge('2000-02-29', '2027-11-03');
      expect(toIsoDate(nextBirthday.date)).toBe('2028-02-29');
      expect(nextBirthday.isObservedOnFeb28).toBe(false);
    });

    it('treats 28 Feb in a common year as the birthday itself', () => {
      const { nextBirthday } = calculateAge('2000-02-29', '2023-02-28');
      expect(nextBirthday.isToday).toBe(true);
      expect(nextBirthday.daysUntil).toBe(0);
    });

    it('does not treat 28 Feb in a leap year as the birthday', () => {
      const { nextBirthday } = calculateAge('2000-02-29', '2024-02-28');
      expect(nextBirthday.isToday).toBe(false);
      expect(nextBirthday.daysUntil).toBe(1);
    });
  });

  describe('month-end calculations', () => {
    it('clamps to the shorter month and counts it as a full month', () => {
      expect(ymd(calculateAge('2023-01-31', '2023-02-28'))).toEqual([0, 1, 0]);
      expect(ymd(calculateAge('2024-01-31', '2024-02-29'))).toEqual([0, 1, 0]);
    });

    it('does not carry a clamped day into later months', () => {
      expect(ymd(calculateAge('2023-01-31', '2023-03-31'))).toEqual([0, 2, 0]);
      expect(ymd(calculateAge('2023-01-31', '2023-03-30'))).toEqual([0, 1, 30]);
    });

    it('counts the days after a clamped month end', () => {
      expect(ymd(calculateAge('2023-01-31', '2023-03-01'))).toEqual([0, 1, 1]);
    });

    it('handles 30 and 31 day neighbours', () => {
      expect(ymd(calculateAge('2023-03-31', '2023-04-30'))).toEqual([0, 1, 0]);
      expect(ymd(calculateAge('2023-05-31', '2023-06-30'))).toEqual([0, 1, 0]);
      expect(ymd(calculateAge('2023-04-30', '2023-05-30'))).toEqual([0, 1, 0]);
      expect(ymd(calculateAge('2023-04-30', '2023-05-31'))).toEqual([0, 1, 1]);
    });
  });

  describe('year-end calculations', () => {
    it('crosses a year boundary without counting a full year', () => {
      expect(ymd(calculateAge('2023-12-31', '2024-01-01'))).toEqual([0, 0, 1]);
      expect(ymd(calculateAge('2023-12-15', '2024-01-10'))).toEqual([0, 0, 26]);
    });

    it('reaches a full year exactly on the anniversary', () => {
      // 31 Dec + 11 months clamps to 30 Nov, which is 30 days before 30 Dec.
      expect(ymd(calculateAge('2023-12-31', '2024-12-30'))).toEqual([0, 11, 30]);
      expect(ymd(calculateAge('2023-12-31', '2024-12-31'))).toEqual([1, 0, 0]);
    });

    it('rolls the next birthday into the following year', () => {
      const { nextBirthday } = calculateAge('2000-01-01', '2025-12-31');
      expect(toIsoDate(nextBirthday.date)).toBe('2026-01-01');
      expect(nextBirthday.daysUntil).toBe(1);
    });
  });

  describe('next birthday', () => {
    it('counts the days from the reference design dates', () => {
      const { nextBirthday } = calculateAge('1998-06-15', '2026-11-03');
      expect(toIsoDate(nextBirthday.date)).toBe('2027-06-15');
      expect(nextBirthday.daysUntil).toBe(224);
      expect(nextBirthday.turning).toBe(29);
    });

    it('stays in the current year when the birthday is still ahead', () => {
      const { nextBirthday } = calculateAge('2000-12-25', '2026-11-03');
      expect(toIsoDate(nextBirthday.date)).toBe('2026-12-25');
      expect(nextBirthday.daysUntil).toBe(52);
    });

    it('reports a birthday falling on the calculation date', () => {
      const { nextBirthday } = calculateAge('2000-11-03', '2026-11-03');
      expect(nextBirthday.isToday).toBe(true);
      expect(nextBirthday.daysUntil).toBe(0);
      expect(nextBirthday.turning).toBe(26);
    });
  });

  describe('invalid input', () => {
    it('returns null when the calculation date is before the birth date', () => {
      expect(calculateAge('2026-11-03', '2026-11-02')).toBeNull();
    });

    it('returns null for malformed or impossible dates', () => {
      expect(calculateAge('', '2026-11-03')).toBeNull();
      expect(calculateAge('2023-02-29', '2026-11-03')).toBeNull();
      expect(calculateAge('not-a-date', '2026-11-03')).toBeNull();
    });
  });
});
