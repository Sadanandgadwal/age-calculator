import { formatDate, parseDate } from '../../utils/date.js';
import { formatClock, parseClock } from '../time/logic.js';

export function evaluateTarget({ date, time }) {
  const errors = {};
  const parsed = date ? parseDate(date) : null;
  if (!date) errors.date = 'Please choose a target date.';
  else if (!parsed) errors.date = 'Please enter a real date with a year from 1000 onward.';

  const seconds = time ? parseClock(time) : 0;
  if (seconds === null) errors.time = 'Please enter a valid time.';

  if (Object.keys(errors).length > 0) return { errors };

  const target = new Date(parsed.year, parsed.month - 1, parsed.day, 0, 0, seconds);
  return { errors, targetMs: target.getTime(), targetLabel: formatDate(parsed), targetTime: formatClock(seconds) };
}

export function splitCountdown(remainingMs) {
  const total = Math.ceil(Math.max(0, remainingMs) / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export const describeEvent = (name) => name.trim() || 'your event';

export function buildResultText(name, targetLabel, { days, hours, minutes, seconds }) {
  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds until ${describeEvent(name)} (${targetLabel})`;
}

export const buildReport = ({ eventName, targetLabel, targetTime, status }, { days, hours, minutes, seconds }) => ({
  inputs: [
    { label: 'Event', value: describeEvent(eventName) },
    { label: 'Target date', value: targetLabel },
    { label: 'Target time', value: targetTime },
  ],
  results: [
    { label: 'Days', value: days.toLocaleString('en-IN') },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ],
  notes: status === 'finished' ? ['Event reached!'] : null,
});
