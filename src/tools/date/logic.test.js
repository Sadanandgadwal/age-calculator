import { describe, expect, it } from 'vitest';
import { MODES, addDays, buildResultText, calculateRange, countWeekdays, evaluate, formatDuration, formatWeeks, getMode, shiftSummary } from './logic.js';
import { parseDate, toDayNumber, toIsoDate } from '../../utils/date.js';

const range = (start, end, includeEnd = false) => calculateRange(parseDate(start), parseDate(end), includeEnd);
const shifted = (modeId, start, amount) => {
  const { result, errors } = evaluate(getMode(modeId), { start, amount });
  return result ? toIsoDate(result.end) : errors;
};

describe('modes', () => {
  it('has all ten modes', () => {
    expect(MODES).toHaveLength(10);
    expect(new Set(MODES.map(({ id }) => id)).size).toBe(10);
  });
});

describe('days between dates', () => {
  it('counts days, weeks and months', () => {
    const result = range('2026-01-01', '2026-03-01');
    expect(result.totalDays).toBe(59);
    expect(result.weeks).toBe(8);
    expect(result.remainderDays).toBe(3);
    expect(result.totalMonths).toBe(2);
    expect([result.years, result.months, result.days]).toEqual([0, 2, 0]);
  });

  it('counts a same-day range according to the option', () => {
    expect(range('2026-01-01', '2026-01-01').totalDays).toBe(0);
    expect(range('2026-01-01', '2026-01-01', true).totalDays).toBe(1);
  });

  it('adds one day when the end date is included', () => {
    expect(range('2026-01-01', '2026-01-02').totalDays).toBe(1);
    expect(range('2026-01-01', '2026-01-02', true).totalDays).toBe(2);
  });

  it('includes the end date in years, months and days', () => {
    const included = range('2026-01-01', '2026-12-31', true);
    expect([included.years, included.months, included.days]).toEqual([1, 0, 0]);
    const excluded = range('2026-01-01', '2026-12-31');
    expect([excluded.years, excluded.months, excluded.days]).toEqual([0, 11, 30]);
  });

  it('handles leap years', () => {
    expect(range('2024-01-01', '2024-03-01').totalDays).toBe(60);
    expect(range('2024-01-01', '2025-01-01').totalDays).toBe(366);
    expect(range('2023-01-01', '2024-01-01').totalDays).toBe(365);
    expect(range('1900-02-28', '1900-03-01').totalDays).toBe(1);
    expect(range('2000-02-28', '2000-03-01').totalDays).toBe(2);
  });

  it('handles month boundaries', () => {
    expect(range('2026-01-31', '2026-02-01').totalDays).toBe(1);
    expect(range('2026-04-30', '2026-05-01').totalDays).toBe(1);
    const monthEnd = range('2026-01-31', '2026-03-31');
    expect([monthEnd.years, monthEnd.months, monthEnd.days]).toEqual([0, 2, 0]);
  });

  it('handles year boundaries', () => {
    expect(range('2025-12-31', '2026-01-01').totalDays).toBe(1);
    const year = range('2025-12-31', '2026-01-01');
    expect([year.years, year.months, year.days]).toEqual([0, 0, 1]);
  });
});

describe('business days, weekdays and weekends', () => {
  it('knows which days are weekdays', () => {
    expect(countWeekdays(toDayNumber(parseDate('2026-11-02')), 5)).toBe(5);
    expect(countWeekdays(toDayNumber(parseDate('2026-11-07')), 2)).toBe(0);
    expect(countWeekdays(toDayNumber(parseDate('1900-01-01')), 5)).toBe(5);
  });

  it('counts a Monday to Friday week', () => {
    const result = range('2026-11-02', '2026-11-06', true);
    expect(result.weekdays).toBe(5);
    expect(result.weekends).toBe(0);
  });

  it('excludes the end date when asked', () => {
    expect(range('2026-11-02', '2026-11-06').weekdays).toBe(4);
  });

  it('counts a whole weekend', () => {
    const result = range('2026-11-07', '2026-11-08', true);
    expect(result.weekdays).toBe(0);
    expect(result.weekends).toBe(2);
  });

  it('counts ranges that cross weekends', () => {
    const result = range('2026-11-06', '2026-11-09', true);
    expect(result.weekdays).toBe(2);
    expect(result.weekends).toBe(2);
  });

  it('counts multiple weeks and always adds up to the total', () => {
    const result = range('2026-01-01', '2026-12-31', true);
    expect(result.totalDays).toBe(365);
    expect(result.weekdays).toBe(261);
    expect(result.weekends).toBe(104);
  });

  it('matches a day-by-day count', () => {
    let weekdays = 0;
    for (let offset = 0; offset < 400; offset += 1) {
      const date = addDays(parseDate('2023-12-29'), offset);
      const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
      if (weekday !== 0 && weekday !== 6) weekdays += 1;
    }
    expect(countWeekdays(toDayNumber(parseDate('2023-12-29')), 400)).toBe(weekdays);
  });
});

describe('adding and subtracting', () => {
  it.each([
    ['add-days', '2026-01-31', '1', '2026-02-01'],
    ['add-days', '2026-12-31', '1', '2027-01-01'],
    ['add-days', '2024-02-28', '1', '2024-02-29'],
    ['add-days', '2023-02-28', '1', '2023-03-01'],
    ['add-days', '2026-01-01', '365', '2027-01-01'],
    ['subtract-days', '2026-03-01', '1', '2026-02-28'],
    ['subtract-days', '2024-03-01', '1', '2024-02-29'],
    ['subtract-days', '2026-01-01', '1', '2025-12-31'],
    ['date-after', '2026-11-03', '30', '2026-12-03'],
    ['add-months', '2026-01-15', '1', '2026-02-15'],
    ['add-months', '2026-01-31', '1', '2026-02-28'],
    ['add-months', '2024-01-31', '1', '2024-02-29'],
    ['add-months', '2026-11-30', '3', '2027-02-28'],
    ['add-months', '2026-12-15', '1', '2027-01-15'],
    ['subtract-months', '2026-03-31', '1', '2026-02-28'],
    ['subtract-months', '2026-01-15', '1', '2025-12-15'],
    ['subtract-months', '2026-01-15', '13', '2024-12-15'],
    ['add-years', '2024-02-29', '1', '2025-02-28'],
    ['add-years', '2024-02-29', '4', '2028-02-29'],
    ['add-years', '2026-11-03', '10', '2036-11-03'],
    ['subtract-years', '2024-02-29', '1', '2023-02-28'],
    ['subtract-years', '2026-11-03', '26', '2000-11-03'],
  ])('%s: %s and %s gives %s', (mode, start, amount, expected) => {
    expect(shifted(mode, start, amount)).toBe(expected);
  });

  it('adding zero keeps the date', () => {
    expect(shifted('add-days', '2026-11-03', '0')).toBe('2026-11-03');
    expect(shifted('add-months', '2026-11-03', '0')).toBe('2026-11-03');
  });

  it('flags a clamped month end', () => {
    const run = (start, amount) => evaluate(getMode('add-months'), { start, amount }).result.clamped;
    expect(run('2026-01-31', '1')).toBe(true);
    expect(run('2026-01-15', '1')).toBe(false);
    expect(evaluate(getMode('add-days'), { start: '2026-01-31', amount: '1' }).result.clamped).toBe(false);
  });

  it('reports the difference, whichever direction it goes', () => {
    expect(evaluate(getMode('add-days'), { start: '2026-01-01', amount: '10' }).result.totalDays).toBe(10);
    expect(evaluate(getMode('subtract-days'), { start: '2026-01-11', amount: '10' }).result.totalDays).toBe(10);
  });

  it('keeps the entered date as the start when subtracting', () => {
    const { result } = evaluate(getMode('subtract-days'), { start: '2026-01-11', amount: '10' });
    expect(toIsoDate(result.start)).toBe('2026-01-11');
    expect(toIsoDate(result.end)).toBe('2026-01-01');
  });
});

describe('validation', () => {
  const rangeMode = getMode('days-between');
  const shiftMode = getMode('add-days');

  it('requires dates', () => {
    expect(evaluate(rangeMode, { start: '', end: '' }).errors).toEqual({
      start: 'Please choose a start date.',
      end: 'Please choose an end date.',
    });
  });

  it('rejects a reversed range', () => {
    expect(evaluate(rangeMode, { start: '2026-01-02', end: '2026-01-01' }).errors.end).toBe("The end date can't be earlier than the start date.");
  });

  it('reports partly typed and impossible dates', () => {
    expect(evaluate(rangeMode, { start: '', startIncomplete: true, end: '2026-01-01' }).errors.start).toMatch(/incomplete/);
    expect(evaluate(rangeMode, { start: '2026-01-01', end: '', endIncomplete: true }).errors.end).toMatch(/incomplete/);
    expect(evaluate(rangeMode, { start: '2023-02-29', end: '2026-01-01' }).errors.start).toMatch(/real date/);
    expect(evaluate(rangeMode, { start: '0199-01-01', end: '2026-01-01' }).errors.start).toMatch(/real date/);
  });

  it('requires a whole, non-negative amount', () => {
    expect(evaluate(shiftMode, { start: '2026-01-01', amount: '' }).errors.amount).toBe('Please enter a number.');
    for (const amount of ['-1', '1.5', 'abc', '1e3']) {
      expect(evaluate(shiftMode, { start: '2026-01-01', amount }).errors.amount, amount).toBe('Please enter a whole number of 0 or more.');
    }
  });

  it.each([
    ['add-days', '9999-12-31', '1'],
    ['add-days', '2026-01-01', '999999999999999999'],
    ['subtract-days', '1000-01-01', '1'],
    ['add-months', '9999-12-15', '1'],
    ['subtract-months', '1000-01-15', '1'],
    ['add-years', '2026-01-01', '8000'],
    ['subtract-years', '2026-01-01', '2000'],
    ['add-years', '2026-01-01', '999999999999999999'],
  ])('%s rejects a result out of range: %s and %s', (modeId, start, amount) => {
    expect(evaluate(getMode(modeId), { start, amount }).errors.amount).toBe('The result must be between the years 1000 and 9999.');
  });
});

describe('text', () => {
  it('formats durations', () => {
    expect(formatDuration({ years: 1, months: 2, days: 1 })).toBe('1 year, 2 months, 1 day');
    expect(formatWeeks({ weeks: 8, remainderDays: 3 })).toBe('8 weeks, 3 days');
  });

  it('summarises a shift', () => {
    const { result } = evaluate(getMode('subtract-months'), { start: '2026-03-31', amount: '1' });
    expect(shiftSummary(result)).toBe('31 Mar 2026 − 1 month = 28 Feb 2026');
  });

  it('builds copied text', () => {
    const rangeMode = getMode('business-days');
    const rangeText = buildResultText(rangeMode, evaluate(rangeMode, { start: '2026-11-02', end: '2026-11-06', includeEnd: true }).result);
    expect(rangeText).toContain('Start date: Monday, 2 Nov 2026');
    expect(rangeText).toContain('Total days: 5 days (including the end date)');
    expect(rangeText).toContain('Business days: 5 days');

    const shiftMode = getMode('add-days');
    expect(buildResultText(shiftMode, evaluate(shiftMode, { start: '2026-01-01', amount: '1' }).result)).toContain('1 Jan 2026 + 1 day = 2 Jan 2026');
  });
});
