import { parseClock } from '../time/logic.js';
import { parseDate } from '../../utils/date.js';

const MAX_MS = 8.64e15;
const INTEGER = /^-?\d+$/;

export const MODES = [
  { id: 'to-date', name: 'Timestamp to date' },
  { id: 'to-timestamp', name: 'Date to timestamp' },
];
export const UNITS = [
  { id: 'seconds', name: 'Seconds' },
  { id: 'milliseconds', name: 'Milliseconds' },
];
export const ZONE_MODES = [
  { id: 'local', name: 'Local time' },
  { id: 'utc', name: 'UTC' },
];

const localFormatter = () => new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' });
export const localZoneName = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function describeInstant(ms) {
  const date = new Date(ms);
  return {
    ms,
    seconds: Math.floor(ms / 1000),
    utc: date.toUTCString(),
    local: localFormatter().format(date),
    iso: date.toISOString(),
  };
}

export function fromTimestamp(text, unit) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return { errors: { timestamp: 'Please enter a timestamp.' } };
  if (!INTEGER.test(trimmed)) return { errors: { timestamp: 'Please enter a whole number, with no decimals, commas or symbols.' } };

  const ms = Number(trimmed) * (unit === 'seconds' ? 1000 : 1);
  if (!Number.isSafeInteger(ms) || Math.abs(ms) > MAX_MS) return { errors: { timestamp: 'This timestamp is outside the supported date range.' } };

  const looksLikeMilliseconds = unit === 'seconds' && trimmed.replace('-', '').length >= 13;
  const looksLikeSeconds = unit === 'milliseconds' && trimmed.replace('-', '').length <= 10 && ms !== 0;
  let hint = null;
  if (looksLikeMilliseconds) hint = 'This number looks like milliseconds. Switch the unit if the date seems wrong.';
  if (looksLikeSeconds) hint = 'This number looks like seconds. Switch the unit if the date seems wrong.';

  return { errors: {}, result: { ...describeInstant(ms), hint } };
}

export function toTimestamp({ date, time, zoneMode }) {
  const errors = {};
  const parsed = date ? parseDate(date) : null;
  if (!date) errors.date = 'Please choose a date.';
  else if (!parsed) errors.date = 'Please enter a real date with a year from 1000 onward.';

  const seconds = time ? parseClock(time) : 0;
  if (seconds === null) errors.time = 'Please enter a valid time.';
  if (Object.keys(errors).length > 0) return { errors };

  const ms =
    zoneMode === 'utc'
      ? Date.UTC(parsed.year, parsed.month - 1, parsed.day, 0, 0, seconds)
      : new Date(parsed.year, parsed.month - 1, parsed.day, 0, 0, seconds).getTime();

  return { errors, result: { ...describeInstant(ms), hint: null } };
}

const pad = (value, size = 2) => String(value).padStart(size, '0');

export function currentDateTime(nowMs, zoneMode) {
  const date = new Date(nowMs);
  const utc = zoneMode === 'utc';
  const part = (name) => date[`get${utc ? 'UTC' : ''}${name}`]();
  return {
    date: `${pad(part('FullYear'), 4)}-${pad(part('Month') + 1)}-${pad(part('Date'))}`,
    time: `${pad(part('Hours'))}:${pad(part('Minutes'))}:${pad(part('Seconds'))}`,
  };
}

export const currentTimestamp = (nowMs, unit) => String(unit === 'seconds' ? Math.floor(nowMs / 1000) : nowMs);

export const buildResultText = ({ seconds, ms, utc, local, iso }) =>
  [`Unix timestamp (seconds): ${seconds}`, `Unix timestamp (milliseconds): ${ms}`, `UTC: ${utc}`, `Local: ${local}`, `ISO 8601: ${iso}`].join('\n');
