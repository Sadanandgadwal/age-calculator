import { checkNumber } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

const DAY = 86400;
const YEAR = 365.25 * DAY;

export const PERIODS = [
  { id: 'day', name: 'Day', seconds: DAY },
  { id: 'week', name: 'Week', seconds: 7 * DAY },
  { id: 'month', name: 'Month', seconds: YEAR / 12 },
  { id: 'quarter', name: 'Quarter', seconds: YEAR / 4 },
  { id: 'year', name: 'Year', seconds: YEAR },
];

export const MODES = [
  { id: 'to-downtime', name: 'Uptime to downtime' },
  { id: 'to-uptime', name: 'Downtime to uptime' },
];

export function formatSpan(seconds) {
  if (seconds === 0) return '0 s';
  if (seconds < 1) return `${formatDecimal(seconds * 1000)} ms`;
  const rounded = Math.round(seconds * 10) / 10;
  const days = Math.floor(rounded / DAY);
  const hours = Math.floor((rounded % DAY) / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const rest = Math.round((rounded % 60) * 10) / 10;
  return [days && `${days} d`, hours && `${hours} h`, minutes && `${minutes} min`, rest && `${rest} s`].filter(Boolean).join(' ');
}

const MESSAGE = 'Please enter a percentage from 0 to 100.';

export function evaluateUptime(text) {
  if (!String(text).trim()) return { result: null };
  const { value, error } = checkNumber(text, { required: MESSAGE, max: 100, minMessage: MESSAGE, maxMessage: MESSAGE });
  if (error) return { error, result: null };
  const fraction = (100 - value) / 100;
  return {
    result: {
      uptime: value,
      rows: PERIODS.map(({ id, name, seconds }) => ({ id, name, value: formatSpan(seconds * fraction) })),
    },
  };
}

export function evaluateDowntime(minutesText, periodId) {
  if (!String(minutesText).trim()) return { result: null };
  const period = PERIODS.find(({ id }) => id === periodId);
  const { value, error } = checkNumber(minutesText, { required: 'Please enter the downtime in minutes.', minMessage: "The downtime can't be negative." });
  if (error) return { error, result: null };
  const seconds = value * 60;
  if (seconds > period.seconds) return { error: `That is more downtime than one ${period.name.toLowerCase()} has.`, result: null };
  return { result: { minutes: value, period: period.name, downtime: formatSpan(seconds), uptime: ((period.seconds - seconds) / period.seconds) * 100 } };
}

export const formatUptime = (value) => `${Number(value.toFixed(6))}%`;

export const buildDowntimeText = ({ uptime, rows }) => [`Uptime: ${formatDecimal(uptime)}%`, ...rows.map(({ name, value }) => `Downtime per ${name.toLowerCase()}: ${value}`)].join('\n');

export const buildDowntimeReport = ({ uptime, rows }) => ({
  subtitle: 'Uptime to downtime',
  inputs: [{ label: 'Uptime', value: `${uptime}%` }],
  results: rows.map(({ name, value }) => ({ label: `Allowed downtime per ${name.toLowerCase()}`, value })),
  notes: ['A year is taken as 365.25 days, and a month as one twelfth of a year.'],
});

export const buildUptimeText = ({ period, downtime, uptime }) => `Downtime of ${downtime} in a ${period.toLowerCase()}\nUptime: ${formatUptime(uptime)}`;

export const buildUptimeReport = ({ period, downtime, uptime }) => ({
  subtitle: 'Downtime to uptime',
  inputs: [
    { label: 'Downtime', value: downtime },
    { label: 'Period', value: period },
  ],
  results: [{ label: 'Uptime', value: formatUptime(uptime) }],
  notes: ['A year is taken as 365.25 days, and a month as one twelfth of a year.'],
});
