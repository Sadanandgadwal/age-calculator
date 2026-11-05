import { addMonths, formatDate, getWeekday, parseDate, toDayNumber } from '../../utils/date.js';
import { pluralize } from '../../utils/formatResult.js';

const MS_PER_DAY = 86_400_000;
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

const range = (id, name, title, extra = {}) => ({ id, name, title, kind: 'range', defaultIncludeEnd: false, ...extra });
const shift = (id, name, title, unit, sign, amountLabel) => ({ id, name, title, kind: 'shift', unit, sign, amountLabel });

export const MODES = [
  range('days-between', 'Days between', 'Days between two dates'),
  shift('add-days', 'Add days', 'Add days to a date', 'day', 1, 'Days to add'),
  shift('subtract-days', 'Subtract days', 'Subtract days from a date', 'day', -1, 'Days to subtract'),
  shift('add-months', 'Add months', 'Add months to a date', 'month', 1, 'Months to add'),
  shift('subtract-months', 'Subtract months', 'Subtract months from a date', 'month', -1, 'Months to subtract'),
  shift('add-years', 'Add years', 'Add years to a date', 'year', 1, 'Years to add'),
  shift('subtract-years', 'Subtract years', 'Subtract years from a date', 'year', -1, 'Years to subtract'),
  range('business-days', 'Business days', 'Business days between dates', { defaultIncludeEnd: true, business: true }),
  range('weekdays-weekends', 'Weekdays & weekends', 'Weekdays and weekends between dates', { defaultIncludeEnd: true }),
  shift('date-after', 'Date after N days', 'Find a date after a number of days', 'day', 1, 'Number of days'),
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function addDays({ year, month, day }, count) {
  const date = new Date(Date.UTC(year, month - 1, day + count));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function countWeekdays(startDayNumber, totalDays) {
  const firstWeekday = (((startDayNumber + 4) % 7) + 7) % 7;
  let weekdays = Math.floor(totalDays / 7) * 5;
  for (let offset = 0; offset < totalDays % 7; offset += 1) {
    const weekday = (firstWeekday + offset) % 7;
    if (weekday !== 0 && weekday !== 6) weekdays += 1;
  }
  return weekdays;
}

function calendarDifference(start, endExclusive) {
  const endDay = toDayNumber(endExclusive);
  let totalMonths = (endExclusive.year - start.year) * 12 + (endExclusive.month - start.month);
  if (toDayNumber(addMonths(start, totalMonths)) > endDay) totalMonths -= 1;

  return {
    totalMonths,
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: endDay - toDayNumber(addMonths(start, totalMonths)),
  };
}

export function calculateRange(start, end, includeEnd) {
  const startDay = toDayNumber(start);
  const totalDays = toDayNumber(end) - startDay + (includeEnd ? 1 : 0);
  const weekdays = countWeekdays(startDay, totalDays);

  return {
    start,
    end,
    includeEnd,
    totalDays,
    weeks: Math.floor(totalDays / 7),
    remainderDays: totalDays % 7,
    weekdays,
    weekends: totalDays - weekdays,
    ...calendarDifference(start, addDays(end, includeEnd ? 1 : 0)),
  };
}

function isYearInRange(year) {
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

export function calculateShift(start, amount, unit, sign) {
  let end = null;
  const count = sign * amount;

  if (unit === 'day') {
    const date = addDays(start, count);
    if (Number.isFinite(date.year) && isYearInRange(date.year)) end = date;
  } else {
    const months = unit === 'year' ? count * 12 : count;
    const year = Math.floor((start.year * 12 + start.month - 1 + months) / 12);
    if (isYearInRange(year)) end = addMonths(start, months);
  }
  if (!end) return null;

  const [earlier, later] = sign > 0 ? [start, end] : [end, start];
  return {
    ...calculateRange(earlier, later, false),
    start,
    end,
    amount,
    unit,
    sign,
    clamped: unit !== 'day' && end.day !== start.day,
  };
}

function dateError(text, isIncomplete, requiredMessage) {
  if (isIncomplete) return { error: 'That date looks incomplete. Please enter a valid day, month and year.' };
  if (!text) return { error: requiredMessage };
  const date = parseDate(text);
  return date ? { date } : { error: 'Please enter a real date with a year from 1000 onward.' };
}

export function evaluate(mode, { start, end, amount, includeEnd, startIncomplete = false, endIncomplete = false }) {
  const errors = {};
  const startField = dateError(start, startIncomplete, 'Please choose a start date.');
  if (startField.error) errors.start = startField.error;

  if (mode.kind === 'range') {
    const endField = dateError(end, endIncomplete, 'Please choose an end date.');
    if (endField.error) errors.end = endField.error;
    if (startField.date && endField.date && toDayNumber(endField.date) < toDayNumber(startField.date)) {
      errors.end = "The end date can't be earlier than the start date.";
    }
    if (Object.keys(errors).length > 0) return { errors };
    return { errors, result: { kind: 'range', ...calculateRange(startField.date, endField.date, includeEnd) } };
  }

  const amountText = String(amount ?? '').trim();
  if (!amountText) errors.amount = 'Please enter a number.';
  else if (!/^\d+$/.test(amountText)) errors.amount = 'Please enter a whole number of 0 or more.';
  if (Object.keys(errors).length > 0) return { errors };

  const shifted = calculateShift(startField.date, Number(amountText), mode.unit, mode.sign);
  if (!shifted) return { errors: { amount: 'The result must be between the years 1000 and 9999.' } };
  return { errors, result: { kind: 'shift', ...shifted } };
}

const describeDate = (date) => `${getWeekday(date)}, ${formatDate(date)}`;

export const formatDuration = ({ years, months, days }) =>
  `${pluralize(years, 'year')}, ${pluralize(months, 'month')}, ${pluralize(days, 'day')}`;

export const formatWeeks = ({ weeks, remainderDays }) =>
  `${pluralize(weeks, 'week')}, ${pluralize(remainderDays, 'day')}`;

export const shiftSummary = ({ start, end, amount, unit, sign }) =>
  `${formatDate(start)} ${sign > 0 ? '+' : '−'} ${pluralize(amount, unit)} = ${formatDate(end)}`;

export function buildResultText(mode, result) {
  if (result.kind === 'shift') {
    return [shiftSummary(result), `Result: ${describeDate(result.end)}`, `Difference: ${pluralize(result.totalDays, 'day')}`].join('\n');
  }

  return [
    `Start date: ${describeDate(result.start)}`,
    `End date: ${describeDate(result.end)}`,
    `Total days: ${pluralize(result.totalDays, 'day')}${result.includeEnd ? ' (including the end date)' : ''}`,
    `${mode.business ? 'Business days' : 'Weekdays'}: ${pluralize(result.weekdays, 'day')}`,
    `Weekends: ${pluralize(result.weekends, 'day')}`,
    `Duration: ${formatDuration(result)}`,
  ].join('\n');
}

export function buildReport(mode, result) {
  const shared = { subtitle: mode.title };
  if (result.kind === 'shift') {
    return {
      ...shared,
      inputs: [
        { label: 'Start date', value: describeDate(result.start) },
        { label: mode.amountLabel, value: result.amount },
      ],
      results: [
        { label: 'Result date', value: formatDate(result.end) },
        { label: 'Day of the week', value: getWeekday(result.end) },
      ],
      details: [
        { label: 'Calculation', value: shiftSummary(result) },
        { label: 'Total days', value: pluralize(result.totalDays, 'day') },
        { label: 'Total weeks', value: formatWeeks(result) },
        { label: 'Years, months and days', value: formatDuration(result) },
      ],
      notes: result.clamped ? [`That month has no day ${result.start.day}, so the result uses the last day of the month.`] : null,
    };
  }
  return {
    ...shared,
    inputs: [
      { label: 'Start date', value: describeDate(result.start) },
      { label: 'End date', value: describeDate(result.end) },
      { label: 'End date counted', value: result.includeEnd ? 'Yes' : 'No' },
    ],
    results: [
      { label: 'Total days', value: result.totalDays.toLocaleString('en-GB') },
      { label: mode.business ? 'Business days' : 'Weekdays', value: result.weekdays.toLocaleString('en-GB') },
      { label: 'Weekend days', value: result.weekends.toLocaleString('en-GB') },
    ],
    details: [
      { label: 'Total weeks', value: formatWeeks(result) },
      { label: 'Total months', value: pluralize(result.totalMonths, 'month') },
      { label: 'Years, months and days', value: formatDuration(result) },
    ],
    notes: mode.business ? ['Business days are Monday to Friday. Public holidays are not removed.'] : null,
  };
}
