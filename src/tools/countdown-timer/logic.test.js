import { describe, expect, it } from 'vitest';
import { buildResultText, describeEvent, evaluateTarget, splitCountdown } from './logic.js';

describe('splitCountdown', () => {
  it('splits into days, hours, minutes and seconds', () => {
    expect(splitCountdown(90061000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(splitCountdown(86400000)).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0 });
  });

  it('rounds part seconds up, so it only shows zero at the end', () => {
    expect(splitCountdown(1).seconds).toBe(1);
    expect(splitCountdown(59500)).toEqual({ days: 0, hours: 0, minutes: 1, seconds: 0 });
  });

  it('never goes below zero', () => {
    expect(splitCountdown(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('evaluateTarget', () => {
  it('reads a date and time as local time', () => {
    const { targetMs, targetLabel, errors } = evaluateTarget({ date: '2027-01-01', time: '10:30' });
    expect(errors).toEqual({});
    expect(targetMs).toBe(new Date(2027, 0, 1, 10, 30).getTime());
    expect(targetLabel).toBe('1 Jan 2027');
  });

  it('defaults to midnight without a time, and accepts seconds', () => {
    expect(evaluateTarget({ date: '2027-01-01', time: '' }).targetMs).toBe(new Date(2027, 0, 1).getTime());
    expect(evaluateTarget({ date: '2027-01-01', time: '00:00:30' }).targetMs).toBe(new Date(2027, 0, 1, 0, 0, 30).getTime());
  });

  it('rejects missing and invalid values', () => {
    expect(evaluateTarget({ date: '', time: '' }).errors.date).toBe('Please choose a target date.');
    expect(evaluateTarget({ date: '2023-02-29', time: '' }).errors.date).toMatch(/real date/);
    expect(evaluateTarget({ date: '2027-01-01', time: '25:00' }).errors.time).toBe('Please enter a valid time.');
  });
});

describe('text', () => {
  it('uses a default event name', () => {
    expect(describeEvent('  ')).toBe('your event');
    expect(describeEvent(' Exam ')).toBe('Exam');
  });

  it('builds copied text', () => {
    expect(buildResultText('Exam', '1 Jan 2027', { days: 1, hours: 2, minutes: 3, seconds: 4 })).toBe('1 days, 2 hours, 3 minutes, 4 seconds until Exam (1 Jan 2027)');
  });
});
