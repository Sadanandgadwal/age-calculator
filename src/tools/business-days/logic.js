import { WEEKDAY_NAMES, weekdayOfDayNumber } from '../../utils/calendar.js';
import { formatDate, parseDate, toDayNumber } from '../../utils/date.js';

const MAX_DAYS = 36525;

export const DEFAULT_WEEKEND = [0, 6];

function dateField(text, requiredMessage) {
  if (!text) return { error: requiredMessage };
  const date = parseDate(text);
  return date ? { date } : { error: 'Please enter a real date with a year from 1000 onward.' };
}

export function addHoliday(holidays, text) {
  const { date, error } = dateField(text, 'Please choose a holiday date.');
  if (error) return { holidays, error };
  if (holidays.includes(text)) return { holidays, error: 'This date is already in your list.' };
  return { holidays: [...holidays, text].sort(), date };
}

export function calculateBusinessDays({ start, end, weekend, holidays, includeEnd }) {
  const first = toDayNumber(start);
  const last = toDayNumber(end) - (includeEnd ? 0 : 1);
  const holidayDays = new Set(holidays.map((text) => toDayNumber(parseDate(text))));
  const weekendDays = new Set(weekend);
  let working = 0;
  let weekends = 0;
  let holidaysExcluded = 0;

  for (let day = first; day <= last; day += 1) {
    if (weekendDays.has(weekdayOfDayNumber(day))) weekends += 1;
    else if (holidayDays.has(day)) holidaysExcluded += 1;
    else working += 1;
  }

  return { start, end, includeEnd, totalDays: Math.max(0, last - first + 1), working, weekends, holidaysExcluded };
}

export function evaluate({ start, end, weekend, holidays, includeEnd }) {
  const errors = {};
  const startField = dateField(start, 'Please choose a start date.');
  const endField = dateField(end, 'Please choose an end date.');
  if (startField.error) errors.start = startField.error;
  if (endField.error) errors.end = endField.error;

  if (startField.date && endField.date) {
    const days = toDayNumber(endField.date) - toDayNumber(startField.date);
    if (days < 0) errors.end = "The end date can't be earlier than the start date.";
    else if (days > MAX_DAYS) errors.end = 'Please choose a range of 100 years or less.';
  }
  if (weekend.length === WEEKDAY_NAMES.length) errors.weekend = 'Leave at least one working day in the week.';

  if (Object.keys(errors).length > 0) return { errors };
  return {
    errors,
    result: calculateBusinessDays({ start: startField.date, end: endField.date, weekend, holidays, includeEnd }),
  };
}

export const describeWeekend = (weekend) =>
  weekend.length === 0 ? 'None' : [...weekend].sort((a, b) => a - b).map((index) => WEEKDAY_NAMES[index]).join(', ');

export const buildResultText = (result, weekend) =>
  [
    `From ${formatDate(result.start)} to ${formatDate(result.end)}${result.includeEnd ? ' (end date counted)' : ''}`,
    `Working days: ${result.working}`,
    `Weekend days: ${result.weekends}`,
    `Holidays excluded: ${result.holidaysExcluded}`,
    `Total calendar days: ${result.totalDays}`,
    `Weekend: ${describeWeekend(weekend)}`,
  ].join('\n');
