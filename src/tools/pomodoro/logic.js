import { checkNumber, collectFields } from '../../utils/fieldValidation.js';

export const SESSIONS = [
  { id: 'focus', name: 'Focus', label: 'Focus session', tone: 'bg-secondary' },
  { id: 'short', name: 'Short break', label: 'Short break', tone: 'bg-soft-yellow' },
  { id: 'long', name: 'Long break', label: 'Long break', tone: 'bg-soft-lavender' },
];

export const DEFAULT_MINUTES = { focus: '25', short: '5', long: '15' };
export const FOCUS_SESSIONS_PER_LONG_BREAK = 4;

export const getSession = (id) => SESSIONS.find((session) => session.id === id);

export function validateMinutes(minutes) {
  const check = (text) =>
    checkNumber(text, { required: 'Please enter the minutes.', min: 1, max: 180, whole: true, minMessage: 'Please enter 1 to 180 minutes.', maxMessage: 'Please enter 1 to 180 minutes.' });
  return collectFields({ focus: check(minutes.focus), short: check(minutes.short), long: check(minutes.long) });
}

export function nextSession(current, completedFocus) {
  if (current !== 'focus') return 'focus';
  return completedFocus % FOCUS_SESSIONS_PER_LONG_BREAK === 0 ? 'long' : 'short';
}

export const focusUntilLongBreak = (completedFocus) => FOCUS_SESSIONS_PER_LONG_BREAK - (completedFocus % FOCUS_SESSIONS_PER_LONG_BREAK);

export function formatRemaining(ms) {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function completionMessage(finished, next) {
  const done = finished === 'focus' ? 'Focus session complete.' : 'Break over.';
  return `${done} Next: ${getSession(next).label.toLowerCase()}. Select Start when you are ready.`;
}

export const buildResultText = (sessionLabel, remaining, completed, minutes) =>
  [
    `Current session: ${sessionLabel} (${remaining} left)`,
    `Focus sessions completed: ${completed}`,
    `Sessions until long break: ${focusUntilLongBreak(completed)}`,
    `Session lengths: focus ${minutes.focus ?? '-'}, short break ${minutes.short ?? '-'}, long break ${minutes.long ?? '-'} minutes`,
  ].join('\n');

export const buildReport = (sessionLabel, remaining, completed, { focus, short, long }) => ({
  inputs: [
    { label: 'Focus session', value: `${focus ?? '—'} minutes` },
    { label: 'Short break', value: `${short ?? '—'} minutes` },
    { label: 'Long break', value: `${long ?? '—'} minutes` },
  ],
  results: [
    { label: 'Focus sessions completed', value: completed },
    { label: 'Sessions until long break', value: focusUntilLongBreak(completed) },
  ],
  details: [
    { label: 'Current session', value: sessionLabel },
    { label: 'Time left', value: remaining },
    { label: 'Total focus time completed', value: `${completed * (focus ?? 0)} minutes` },
  ],
});
