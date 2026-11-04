import { WEEKDAY_NAMES, isoWeek, isoWeeksInYear, weekdayIndex } from '../../utils/calendar.js';
import { formatDate, parseDate } from '../../utils/date.js';

export function calculateWeek(date) {
  const { week, year, start, end } = isoWeek(date);
  return {
    date,
    week,
    weekYear: year,
    start,
    end,
    weekday: WEEKDAY_NAMES[weekdayIndex(date)],
    weeksInYear: isoWeeksInYear(year),
    label: `${year}-W${String(week).padStart(2, '0')}`,
    crossesYear: year !== date.year,
  };
}

export function evaluate(text) {
  if (!text) return { errors: { date: 'Please choose a date.' } };
  const date = parseDate(text);
  if (!date) return { errors: { date: 'Please enter a real date with a year from 1000 onward.' } };
  return { errors: {}, result: calculateWeek(date) };
}

export const buildResultText = (result) =>
  [
    `${formatDate(result.date)} (${result.weekday}) is in ISO week ${result.week} of ${result.weekYear}`,
    `Week code: ${result.label}`,
    `Week start: ${formatDate(result.start)}`,
    `Week end: ${formatDate(result.end)}`,
  ].join('\n');
