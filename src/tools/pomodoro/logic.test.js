import { describe, expect, it } from 'vitest';
import { DEFAULT_MINUTES, completionMessage, focusUntilLongBreak, formatRemaining, nextSession, validateMinutes } from './logic.js';

describe('defaults', () => {
  it('use the standard lengths', () => {
    expect(DEFAULT_MINUTES).toEqual({ focus: '25', short: '5', long: '15' });
  });
});

describe('nextSession', () => {
  it('follows focus with a short break, and every fourth with a long break', () => {
    expect(nextSession('focus', 1)).toBe('short');
    expect(nextSession('focus', 2)).toBe('short');
    expect(nextSession('focus', 3)).toBe('short');
    expect(nextSession('focus', 4)).toBe('long');
    expect(nextSession('focus', 8)).toBe('long');
  });

  it('follows a break with focus', () => {
    expect(nextSession('short', 1)).toBe('focus');
    expect(nextSession('long', 4)).toBe('focus');
  });
});

describe('focusUntilLongBreak', () => {
  it('counts down to the long break', () => {
    expect(focusUntilLongBreak(0)).toBe(4);
    expect(focusUntilLongBreak(3)).toBe(1);
    expect(focusUntilLongBreak(4)).toBe(4);
    expect(focusUntilLongBreak(5)).toBe(3);
  });
});

describe('formatRemaining', () => {
  it.each([
    [1500000, '25:00'],
    [59000, '00:59'],
    [1, '00:01'],
    [0, '00:00'],
    [-500, '00:00'],
    [10800000, '180:00'],
  ])('formats %s ms as %s', (ms, text) => {
    expect(formatRemaining(ms)).toBe(text);
  });
});

describe('validateMinutes', () => {
  it('accepts valid lengths', () => {
    expect(validateMinutes(DEFAULT_MINUTES)).toMatchObject({ isValid: true, values: { focus: 25, short: 5, long: 15 } });
    expect(validateMinutes({ focus: '1', short: '180', long: '60' }).isValid).toBe(true);
  });

  it.each([
    ['', 'Please enter the minutes.'],
    ['0', 'Please enter 1 to 180 minutes.'],
    ['181', 'Please enter 1 to 180 minutes.'],
    ['-5', 'Please enter 1 to 180 minutes.'],
    ['2.5', 'Please enter a whole number.'],
    ['abc', 'Please enter a valid number, without commas or symbols.'],
  ])('rejects %j', (value, message) => {
    const { errors, isValid } = validateMinutes({ ...DEFAULT_MINUTES, short: value });
    expect(isValid).toBe(false);
    expect(errors.short).toBe(message);
  });
});

describe('completionMessage', () => {
  it('names the next session', () => {
    expect(completionMessage('focus', 'short')).toBe('Focus session complete. Next: short break. Select Start when you are ready.');
    expect(completionMessage('long', 'focus')).toBe('Break over. Next: focus session. Select Start when you are ready.');
  });
});
