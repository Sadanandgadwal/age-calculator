import { formatClock, parseClock } from '../time/logic.js';
import { ALL_ZONES } from './zones.js';
import { formatDate, getWeekday, parseDate, toDayNumber } from '../../utils/date.js';
import { pluralize } from '../../utils/formatResult.js';

const DAY_MS = 86400000;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const formatters = new Map();

function partsFormatter(zone) {
  if (!formatters.has(zone)) {
    formatters.set(
      zone,
      new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    );
  }
  return formatters.get(zone);
}

export function localParts(utcMs, zone) {
  const parts = Object.fromEntries(
    partsFormatter(zone)
      .formatToParts(new Date(utcMs))
      .map(({ type, value }) => [type, Number(value)]),
  );
  return {
    date: { year: parts.year, month: parts.month, day: parts.day },
    seconds: parts.hour * 3600 + parts.minute * 60 + parts.second,
  };
}

export function offsetMs(utcMs, zone) {
  const { date, seconds } = localParts(utcMs, zone);
  return toDayNumber(date) * DAY_MS + seconds * 1000 - Math.floor(utcMs / 1000) * 1000;
}

export function resolveLocalTime(wallMs, zone) {
  const before = offsetMs(wallMs - DAY_MS, zone);
  const after = offsetMs(wallMs + DAY_MS, zone);
  const candidates = [...new Set([wallMs - before, wallMs - after])];
  const valid = candidates.filter((utc) => utc + offsetMs(utc, zone) === wallMs).sort((a, b) => a - b);

  if (valid.length === 0) return { utcMs: wallMs - before, status: 'skipped' };
  return { utcMs: valid[0], status: valid.length > 1 ? 'repeated' : 'exact' };
}

export function formatOffset(ms) {
  const totalMinutes = Math.round(Math.abs(ms) / 60000);
  const pad = (value) => String(value).padStart(2, '0');
  return `UTC${ms < 0 ? '−' : '+'}${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

export function formatDifference(ms) {
  if (ms === 0) return 'Same time';
  const totalMinutes = Math.round(Math.abs(ms) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const size = [hours && pluralize(hours, 'hour'), minutes && pluralize(minutes, 'minute')].filter(Boolean).join(' ');
  return `${size} ${ms > 0 ? 'ahead' : 'behind'}`;
}

function zoneName(utcMs, zone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'long' }).formatToParts(new Date(utcMs));
  return parts.find(({ type }) => type === 'timeZoneName')?.value ?? zone;
}

function describeZone(utcMs, zone) {
  const { date, seconds } = localParts(utcMs, zone);
  return {
    zone,
    label: ALL_ZONES.find(({ id }) => id === zone)?.label ?? zone,
    date,
    time: formatClock(seconds),
    dateText: `${getWeekday(date)}, ${formatDate(date)}`,
    offsetMs: offsetMs(utcMs, zone),
    offset: formatOffset(offsetMs(utcMs, zone)),
    name: zoneName(utcMs, zone),
  };
}

function describeDayChange(from, to) {
  const days = toDayNumber(to) - toDayNumber(from);
  if (days === 0) return 'Same day';
  if (days === 1) return 'Next day';
  return days === -1 ? 'Previous day' : `${days} days`;
}

const NOTES = {
  skipped: 'This local time is skipped when the clocks go forward, so the next valid time is used.',
  repeated: 'This local time happens twice when the clocks go back, so the first occurrence is used.',
};

export function evaluate({ date, time, from, to }) {
  const errors = {};
  const parsed = date ? parseDate(date) : null;
  if (!date) errors.date = 'Please choose a date.';
  else if (!parsed) errors.date = 'Please enter a real date.';
  else if (parsed.year < MIN_YEAR || parsed.year > MAX_YEAR) errors.date = `Please choose a date from ${MIN_YEAR} to ${MAX_YEAR}.`;

  const seconds = time ? parseClock(time) : null;
  if (seconds === null) errors.time = time ? 'Please enter a valid time.' : 'Please choose a time.';

  if (Object.keys(errors).length > 0) return { errors };

  const { utcMs, status } = resolveLocalTime(toDayNumber(parsed) * DAY_MS + seconds * 1000, from);
  const source = describeZone(utcMs, from);
  const target = describeZone(utcMs, to);

  return {
    errors,
    result: {
      source,
      target,
      difference: formatDifference(target.offsetMs - source.offsetMs),
      dayChange: describeDayChange(source.date, target.date),
      note: NOTES[status] ?? null,
    },
  };
}

export const buildResultText = ({ source, target, difference, dayChange }) =>
  [
    `From: ${source.time}, ${source.dateText} (${source.label}, ${source.offset})`,
    `To: ${target.time}, ${target.dateText} (${target.label}, ${target.offset})`,
    `Difference: ${difference}`,
    `Day: ${dayChange}`,
  ].join('\n');

export const buildReport = ({ source, target, difference, dayChange, note }) => ({
  inputs: [
    { label: 'Date and time', value: `${source.time}, ${source.dateText}` },
    { label: 'From time zone', value: `${source.label} (${source.offset})` },
    { label: 'To time zone', value: `${target.label} (${target.offset})` },
  ],
  results: [
    { label: `Converted time (${target.name})`, value: target.time },
    { label: 'Converted date', value: target.dateText },
  ],
  details: [
    { label: 'Time difference', value: difference },
    { label: 'Day change', value: dayChange },
  ],
  notes: note ? [note] : null,
});
