import { WEEKDAY_NAMES, dayOfYear, daysInYear, isoWeek, weekdayIndex } from '../../utils/calendar.js';
import { daysInMonth, formatDate, isLeapYear, parseDate, toDayNumber } from '../../utils/date.js';
import { pluralize } from '../../utils/formatResult.js';

export function describeRelative(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return days > 0 ? `${pluralize(days, 'day')} from today` : `${pluralize(-days, 'day')} ago`;
}

export function calculateDay(date, today) {
  const index = weekdayIndex(date);
  const week = isoWeek(date);
  return {
    date,
    weekday: WEEKDAY_NAMES[index],
    isWeekend: index === 0 || index === 6,
    dayOfYear: dayOfYear(date),
    daysInYear: daysInYear(date.year),
    week: week.week,
    weekYear: week.year,
    isLeapYear: isLeapYear(date.year),
    daysInMonth: daysInMonth(date.year, date.month),
    relative: describeRelative(toDayNumber(date) - toDayNumber(today)),
  };
}

export function evaluate(text, todayText) {
  if (!text) return { errors: { date: 'Please choose a date.' } };
  const date = parseDate(text);
  if (!date) return { errors: { date: 'Please enter a real date with a year from 1000 onward.' } };
  return { errors: {}, result: calculateDay(date, parseDate(todayText)) };
}

export const buildResultText = (result) =>
  [
    `${formatDate(result.date)} is a ${result.weekday}`,
    `Day ${result.dayOfYear} of ${result.daysInYear}`,
    `ISO week ${result.week} of ${result.weekYear}`,
    `Leap year: ${result.isLeapYear ? 'Yes' : 'No'}`,
    result.relative,
  ].join('\n');
