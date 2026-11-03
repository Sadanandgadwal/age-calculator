import {
  addMonths,
  daysInMonth,
  getWeekday,
  parseDate,
  toDayNumber,
} from './date.js';

const FEBRUARY = 2;

/** The date a birthday falls on in a given year. 29 Feb is observed on 28 Feb in common years. */
function birthdayInYear(birth, year) {
  return {
    year,
    month: birth.month,
    day: Math.min(birth.day, daysInMonth(year, birth.month)),
  };
}

function getNextBirthday(birth, asOf) {
  const asOfDay = toDayNumber(asOf);
  const isBirthDate = asOfDay === toDayNumber(birth);

  let date = birthdayInYear(birth, asOf.year);
  const hasPassed = toDayNumber(date) < asOfDay;
  if (hasPassed || isBirthDate) {
    date = birthdayInYear(birth, asOf.year + 1);
  }

  const daysUntil = toDayNumber(date) - asOfDay;

  return {
    date,
    daysUntil,
    turning: date.year - birth.year,
    isToday: daysUntil === 0,
    isObservedOnFeb28: birth.month === FEBRUARY && birth.day === 29 && date.day === 28,
  };
}

/**
 * Calculates an exact calendar age between two YYYY-MM-DD strings.
 *
 * It counts the whole calendar months that fit between the dates, then the
 * remaining days. Each month is added to the original birth date rather than
 * step by step, so a clamped month end doesn't carry over: 31 Jan to 31 Mar is
 * exactly 2 months, even though the path passes through 28 Feb.
 *
 * Callers must validate first. Returns null if the dates are invalid or the
 * calculation date is before the birth date.
 */
export function calculateAge(birthIso, asOfIso) {
  const birth = parseDate(birthIso);
  const asOf = parseDate(asOfIso);
  if (!birth || !asOf) return null;

  const birthDay = toDayNumber(birth);
  const asOfDay = toDayNumber(asOf);
  if (asOfDay < birthDay) return null;

  let totalMonths = (asOf.year - birth.year) * 12 + (asOf.month - birth.month);
  if (toDayNumber(addMonths(birth, totalMonths)) > asOfDay) {
    totalMonths -= 1;
  }

  const totalDays = asOfDay - birthDay;

  return {
    birthDate: birth,
    asOfDate: asOf,
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: asOfDay - toDayNumber(addMonths(birth, totalMonths)),
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths,
    bornOnWeekday: getWeekday(birth),
    nextBirthday: getNextBirthday(birth, asOf),
  };
}
