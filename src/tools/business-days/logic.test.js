import { describe, expect, it } from 'vitest';
import { addHoliday, buildResultText, calculateBusinessDays, describeWeekend, evaluate } from './logic.js';
import { parseDate } from '../../utils/date.js';

const run = ({ start = '2026-11-02', end = '2026-11-08', weekend = [0, 6], holidays = [], includeEnd = true } = {}) =>
  calculateBusinessDays({ start: parseDate(start), end: parseDate(end), weekend, holidays, includeEnd });

describe('calculateBusinessDays', () => {
  it('excludes weekends', () => {
    expect(run()).toMatchObject({ totalDays: 7, working: 5, weekends: 2, holidaysExcluded: 0 });
  });

  it('counts the end date only when asked', () => {
    expect(run({ end: '2026-11-06' }).working).toBe(5);
    expect(run({ end: '2026-11-06', includeEnd: false })).toMatchObject({ working: 4, totalDays: 4 });
  });

  it('handles a single day', () => {
    expect(run({ start: '2026-11-02', end: '2026-11-02' })).toMatchObject({ totalDays: 1, working: 1 });
    expect(run({ start: '2026-11-07', end: '2026-11-07' })).toMatchObject({ totalDays: 1, working: 0, weekends: 1 });
    expect(run({ start: '2026-11-02', end: '2026-11-02', includeEnd: false })).toMatchObject({ totalDays: 0, working: 0 });
  });

  it('excludes holidays on working days', () => {
    expect(run({ holidays: ['2026-11-04'] })).toMatchObject({ working: 4, holidaysExcluded: 1, weekends: 2, totalDays: 7 });
  });

  it('does not remove a weekend holiday twice', () => {
    expect(run({ holidays: ['2026-11-07'] })).toMatchObject({ working: 5, holidaysExcluded: 0, weekends: 2 });
  });

  it('ignores holidays outside the range', () => {
    expect(run({ holidays: ['2026-12-25'] })).toMatchObject({ working: 5, holidaysExcluded: 0 });
    expect(run({ end: '2026-11-04', includeEnd: false, holidays: ['2026-11-04'] }).holidaysExcluded).toBe(0);
  });

  it('supports other weekends', () => {
    expect(run({ weekend: [0] })).toMatchObject({ working: 6, weekends: 1 });
    expect(run({ weekend: [5, 6] })).toMatchObject({ working: 5, weekends: 2 });
    expect(run({ weekend: [] })).toMatchObject({ working: 7, weekends: 0 });
  });

  it('handles leap years and year boundaries', () => {
    expect(run({ start: '2024-02-26', end: '2024-03-01' }).working).toBe(5);
    expect(run({ start: '2025-12-29', end: '2026-01-02' }).working).toBe(5);
    expect(run({ start: '2026-01-01', end: '2026-12-31' })).toMatchObject({ totalDays: 365, working: 261, weekends: 104 });
  });

  it('always adds up to the total', () => {
    const { totalDays, working, weekends, holidaysExcluded } = run({ start: '2020-01-01', end: '2030-12-31', weekend: [5, 6], holidays: ['2021-01-04', '2025-06-16'] });
    expect(working + weekends + holidaysExcluded).toBe(totalDays);
  });
});

describe('addHoliday', () => {
  it('adds in date order', () => {
    expect(addHoliday(['2026-12-25'], '2026-11-04').holidays).toEqual(['2026-11-04', '2026-12-25']);
  });

  it('rejects missing, invalid and duplicate dates', () => {
    expect(addHoliday([], '').error).toBe('Please choose a holiday date.');
    expect(addHoliday([], '2023-02-29').error).toMatch(/real date/);
    expect(addHoliday(['2026-11-04'], '2026-11-04')).toEqual({ holidays: ['2026-11-04'], error: 'This date is already in your list.' });
  });
});

describe('evaluate', () => {
  const input = { start: '2026-11-02', end: '2026-11-08', weekend: [0, 6], holidays: [], includeEnd: true };

  it('calculates valid input', () => {
    expect(evaluate(input).result.working).toBe(5);
  });

  it('requires dates', () => {
    expect(evaluate({ ...input, start: '', end: '' }).errors).toEqual({ start: 'Please choose a start date.', end: 'Please choose an end date.' });
  });

  it('rejects a reversed range', () => {
    expect(evaluate({ ...input, end: '2026-11-01' }).errors.end).toBe("The end date can't be earlier than the start date.");
  });

  it('rejects very long ranges', () => {
    expect(evaluate({ ...input, end: '2200-01-01' }).errors.end).toBe('Please choose a range of 100 years or less.');
    expect(evaluate({ ...input, start: '2000-01-01', end: '2099-12-31' }).result).toBeTruthy();
  });

  it('needs at least one working day in the week', () => {
    expect(evaluate({ ...input, weekend: [0, 1, 2, 3, 4, 5, 6] }).errors.weekend).toMatch(/at least one working day/);
  });
});

describe('text', () => {
  it('describes the weekend in order', () => {
    expect(describeWeekend([6, 0])).toBe('Sunday, Saturday');
    expect(describeWeekend([])).toBe('None');
  });

  it('builds copied text', () => {
    const text = buildResultText(run({ holidays: ['2026-11-04'] }), [0, 6]);
    expect(text).toContain('From 2 Nov 2026 to 8 Nov 2026 (end date counted)');
    expect(text).toContain('Working days: 4');
    expect(text).toContain('Holidays excluded: 1');
    expect(text).toContain('Total calendar days: 7');
  });
});
