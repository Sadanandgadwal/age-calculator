/**
 * Calendar helpers for date-only values.
 *
 * Dates are plain { year, month, day } objects (month is 1-12). All arithmetic
 * runs through UTC day numbers, so time zones and daylight saving changes can
 * never shift a result by a day.
 */

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Earliest and latest dates accepted by the calculator (4-digit years only). */
export const MIN_DATE = '1000-01-01';
export const MAX_DATE = '9999-12-31';

export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Parses a YYYY-MM-DD string. Returns null for malformed or impossible dates such as 2023-02-30. */
export function parseDate(value) {
  const match = ISO_DATE.exec(value ?? '');
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  if (year < 1000 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;

  return { year, month, day };
}

export function toIsoDate({ year, month, day }) {
  const pad = (number, length) => String(number).padStart(length, '0');
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

/** Serial day number, which makes date differences a simple subtraction. */
export function toDayNumber({ year, month, day }) {
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** Today's date in the user's own time zone. toISOString() would return the UTC date instead. */
export function getTodayIso(now = new Date()) {
  return toIsoDate({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}

/**
 * Adds whole months to a date. A day that doesn't exist in the target month is
 * clamped to that month's last day (31 Jan + 1 month = 28 Feb).
 */
export function addMonths({ year, month, day }, count) {
  const monthIndex = year * 12 + (month - 1) + count;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = (monthIndex % 12) + 1;

  return {
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  };
}

const toUtcDate = ({ year, month, day }) => new Date(Date.UTC(year, month - 1, day));

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  timeZone: 'UTC',
});

/** Formats a date as "15 Jun 1998". */
export function formatDate(date) {
  return dateFormatter.format(toUtcDate(date));
}

/** Returns the weekday name, such as "Monday". */
export function getWeekday(date) {
  return weekdayFormatter.format(toUtcDate(date));
}
