import { isLeapYear, toDayNumber } from './date.js';

const DAY_MS = 86400000;

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const weekdayOfDayNumber = (dayNumber) => (((dayNumber + 4) % 7) + 7) % 7;

export const weekdayIndex = (date) => weekdayOfDayNumber(toDayNumber(date));

export function fromDayNumber(dayNumber) {
  const date = new Date(dayNumber * DAY_MS);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export const addDays = (date, count) => fromDayNumber(toDayNumber(date) + count);

export const dayOfYear = (date) => toDayNumber(date) - toDayNumber({ year: date.year, month: 1, day: 1 }) + 1;

export const daysInYear = (year) => (isLeapYear(year) ? 366 : 365);

export function isoWeek(date) {
  const mondayBased = (weekdayIndex(date) + 6) % 7;
  const start = addDays(date, -mondayBased);
  const thursday = addDays(start, 3);
  const firstOfYear = toDayNumber({ year: thursday.year, month: 1, day: 1 });
  return {
    week: Math.floor((toDayNumber(thursday) - firstOfYear) / 7) + 1,
    year: thursday.year,
    start,
    end: addDays(start, 6),
  };
}

export function isoWeeksInYear(year) {
  return isoWeek({ year, month: 12, day: 28 }).week;
}
