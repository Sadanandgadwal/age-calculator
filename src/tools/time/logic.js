import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { pluralize } from '../../utils/formatResult.js';
import { formatDecimal } from '../../utils/number.js';

const SECONDS_PER_DAY = 86400;
const MAX_PART = 1e9;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

export const MODES = [
  { id: 'add', name: 'Add times', title: 'Add two amounts of time', fields: ['a', 'b'], labelA: 'First time', labelB: 'Time to add' },
  { id: 'subtract', name: 'Subtract times', title: 'Subtract one amount of time from another', fields: ['a', 'b'], labelA: 'First time', labelB: 'Time to subtract' },
  { id: 'between', name: 'Time between', title: 'Time between two clock times', fields: ['start', 'end'] },
  { id: 'after', name: 'Time after', title: 'Find the time after a duration', fields: ['start', 'a'], labelA: 'Time to add', sign: 1 },
  { id: 'before', name: 'Time before', title: 'Find the time before a duration', fields: ['start', 'a'], labelA: 'Time to subtract', sign: -1 },
];

export const getMode = (id) => MODES.find((mode) => mode.id === id);

export function parseClock(text) {
  const match = TIME_PATTERN.exec(text ?? '');
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] ?? 0);
}

export function formatClock(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value) => String(value).padStart(2, '0');
  const clock = `${hours % 12 || 12}:${pad(minutes)}${rest ? `:${pad(rest)}` : ''}`;
  return `${clock} ${hours < 12 ? 'AM' : 'PM'}`;
}

export function splitDuration(totalSeconds) {
  const seconds = Math.abs(totalSeconds);
  return { hours: Math.floor(seconds / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 };
}

export function formatDuration(totalSeconds) {
  const { hours, minutes, seconds } = splitDuration(totalSeconds);
  const text = `${pluralize(hours, 'hour')}, ${pluralize(minutes, 'minute')}, ${pluralize(seconds, 'second')}`;
  return totalSeconds < 0 ? `−${text}` : text;
}

export function describeDayChange(days) {
  if (days === 0) return 'Same day';
  return days > 0 ? `${pluralize(days, 'day')} later` : `${pluralize(-days, 'day')} earlier`;
}

export function shiftClock(startSeconds, amount) {
  const total = startSeconds + amount;
  const days = Math.floor(total / SECONDS_PER_DAY);
  return { seconds: total - days * SECONDS_PER_DAY, days };
}

function durationResult(totalSeconds, summary, note) {
  return { kind: 'duration', totalSeconds, summary, note, ...splitDuration(totalSeconds) };
}

function readDuration(prefix, { hours, minutes, seconds }) {
  const options = { whole: true, max: MAX_PART, maxMessage: 'This value is too large to calculate.' };
  const parts = {
    [`${prefix}Hours`]: checkNumber(hours || '0', options),
    [`${prefix}Minutes`]: checkNumber(minutes || '0', options),
    [`${prefix}Seconds`]: checkNumber(seconds || '0', options),
  };
  const isBlank = ![hours, minutes, seconds].some((part) => String(part ?? '').trim());
  if (isBlank) parts[`${prefix}Hours`] = { error: 'Please enter a time.' };

  const { errors, values, isValid } = collectFields(parts);
  const total = isValid ? values[`${prefix}Hours`] * 3600 + values[`${prefix}Minutes`] * 60 + values[`${prefix}Seconds`] : null;
  return { errors, total };
}

function readClock(field, text, message) {
  const seconds = parseClock(text);
  return seconds === null ? { errors: { [field]: message }, seconds } : { errors: {}, seconds };
}

export function evaluate(modeId, { a, b, start, end }) {
  const mode = getMode(modeId);

  if (modeId === 'add' || modeId === 'subtract') {
    const first = readDuration('a', a);
    const second = readDuration('b', b);
    const errors = { ...first.errors, ...second.errors };
    if (Object.keys(errors).length > 0) return { errors };
    const total = modeId === 'add' ? first.total + second.total : first.total - second.total;
    const symbol = modeId === 'add' ? '+' : '−';
    return { errors, result: durationResult(total, `${formatDuration(first.total)} ${symbol} ${formatDuration(second.total)}`) };
  }

  if (modeId === 'between') {
    const from = readClock('start', start, 'Please choose a start time.');
    const to = readClock('end', end, 'Please choose an end time.');
    const errors = { ...from.errors, ...to.errors };
    if (Object.keys(errors).length > 0) return { errors };
    const isOvernight = to.seconds < from.seconds;
    const total = to.seconds - from.seconds + (isOvernight ? SECONDS_PER_DAY : 0);
    return {
      errors,
      result: durationResult(total, `${formatClock(from.seconds)} to ${formatClock(to.seconds)}`, isOvernight ? 'The end time is earlier than the start time, so it is treated as the next day.' : null),
    };
  }

  const from = readClock('start', start, 'Please choose a start time.');
  const duration = readDuration('a', a);
  const errors = { ...from.errors, ...duration.errors };
  if (Object.keys(errors).length > 0) return { errors };

  const shifted = shiftClock(from.seconds, mode.sign * duration.total);
  return {
    errors,
    result: {
      kind: 'clock',
      time: formatClock(shifted.seconds),
      dayChange: describeDayChange(shifted.days),
      summary: `${formatClock(from.seconds)} ${mode.sign > 0 ? '+' : '−'} ${formatDuration(duration.total)}`,
    },
  };
}

export const getDurationTotals = ({ totalSeconds }) => [
  { label: 'Total Hours', value: formatDecimal(totalSeconds / 3600) },
  { label: 'Total Minutes', value: formatDecimal(totalSeconds / 60) },
  { label: 'Total Seconds', value: formatDecimal(totalSeconds) },
];

export function buildResultText(result) {
  if (result.kind === 'clock') return [result.summary, `Result: ${result.time}`, `Day: ${result.dayChange}`].join('\n');
  return [
    result.summary,
    `Result: ${formatDuration(result.totalSeconds)}`,
    ...getDurationTotals(result).map(({ label, value }) => `${label}: ${value}`),
  ].join('\n');
}
