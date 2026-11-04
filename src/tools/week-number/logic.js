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

export const buildReport = (result) => ({
  inputs: [{ label: 'Date', value: `${result.weekday}, ${formatDate(result.date)}` }],
  results: [
    { label: 'ISO week number', value: result.week },
    { label: 'Week year', value: result.weekYear },
    { label: 'Weekday', value: result.weekday },
  ],
  details: [
    { label: 'Week start (Monday)', value: formatDate(result.start) },
    { label: 'Week end (Sunday)', value: formatDate(result.end) },
    { label: 'Week code', value: result.label },
    { label: `Weeks in ${result.weekYear}`, value: result.weeksInYear },
  ],
  formula: 'ISO weeks start on Monday. Week 1 is the week containing the first Thursday of the year.',
  notes: result.crossesYear ? [`This date is in ${result.date.year}, but its ISO week belongs to ${result.weekYear}.`] : null,
});
