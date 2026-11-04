import { formatClock, parseClock } from '../time/logic.js';
import { checkNumber } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

const DAY_SECONDS = 86400;

export function formatHours(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours} h ${minutes} min${seconds ? ` ${seconds} s` : ''}`;
}

export function calculateWorkHours({ startSeconds, endSeconds, breakMinutes, standardHours }) {
  const isOvernight = endSeconds < startSeconds;
  const shift = endSeconds - startSeconds + (isOvernight ? DAY_SECONDS : 0);
  const breakSeconds = Math.round(breakMinutes * 60);
  const net = shift - breakSeconds;
  const standard = Math.round(standardHours * 3600);

  return {
    startSeconds,
    endSeconds,
    isOvernight,
    shift,
    breakSeconds,
    net,
    standard,
    overtime: Math.max(0, net - standard),
    shortfall: Math.max(0, standard - net),
    decimalHours: net / 3600,
  };
}

export function evaluate({ clockIn, clockOut, breakMinutes, standardHours }) {
  const errors = {};
  const startSeconds = clockIn ? parseClock(clockIn) : null;
  const endSeconds = clockOut ? parseClock(clockOut) : null;
  if (startSeconds === null) errors.clockIn = clockIn ? 'Please enter a valid time.' : 'Please choose a clock-in time.';
  if (endSeconds === null) errors.clockOut = clockOut ? 'Please enter a valid time.' : 'Please choose a clock-out time.';
  if (startSeconds !== null && startSeconds === endSeconds) errors.clockOut = "Clock-out can't be the same as clock-in.";

  const breakField = String(breakMinutes ?? '').trim() ? checkNumber(breakMinutes, { minMessage: "The break can't be negative." }) : { value: 0 };
  if (breakField.error) errors.breakMinutes = breakField.error;

  const hoursMessage = 'Daily hours must be from 0 to 24.';
  const standardField = checkNumber(standardHours, { required: 'Please enter your daily working hours.', max: 24, minMessage: hoursMessage, maxMessage: hoursMessage });
  if (standardField.error) errors.standardHours = standardField.error;

  if (Object.keys(errors).length > 0) return { errors };

  const result = calculateWorkHours({ startSeconds, endSeconds, breakMinutes: breakField.value, standardHours: standardField.value });
  if (result.net <= 0) return { errors: { breakMinutes: 'The break must be shorter than the shift.' } };
  return { errors, result };
}

export const formatDecimalHours = (value) => formatDecimal(value);

export const buildResultText = (result) =>
  [
    `Clock in: ${formatClock(result.startSeconds)}`,
    `Clock out: ${formatClock(result.endSeconds)}${result.isOvernight ? ' (next day)' : ''}`,
    `Total shift: ${formatHours(result.shift)}`,
    `Break: ${formatHours(result.breakSeconds)}`,
    `Net working hours: ${formatHours(result.net)} (${formatDecimalHours(result.decimalHours)} hours)`,
    `Overtime: ${formatHours(result.overtime)}`,
  ].join('\n');

export const buildReport = (result) => ({
  inputs: [
    { label: 'Clock-in', value: formatClock(result.startSeconds) },
    { label: 'Clock-out', value: formatClock(result.endSeconds) },
    { label: 'Break', value: formatHours(result.breakSeconds) },
    { label: 'Daily working hours', value: formatHours(result.standard) },
  ],
  results: [
    { label: 'Net working hours', value: formatHours(result.net) },
    { label: 'Overtime', value: formatHours(result.overtime) },
    { label: 'Total shift', value: formatHours(result.shift) },
  ],
  details: [
    { label: 'Decimal hours', value: formatDecimalHours(result.decimalHours) },
    { label: 'Below daily hours', value: formatHours(result.shortfall) },
  ],
  formula: 'Net hours = shift length − break. Overtime = net hours above the daily working hours.',
  notes: result.isOvernight ? ['Clock-out is earlier than clock-in, so it is treated as the next day.'] : null,
});
