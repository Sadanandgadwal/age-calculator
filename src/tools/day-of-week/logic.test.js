import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { buildResultText, describeRelative, evaluate } from './logic.js';

const TODAY = '2026-11-03';
const run = (date) => evaluate(date, TODAY).result;

describe('weekday', () => {
  it.each([
    ['2026-11-03', 'Tuesday'],
    ['1998-06-15', 'Monday'],
    ['2000-01-01', 'Saturday'],
    ['2024-02-29', 'Thursday'],
    ['1900-03-01', 'Thursday'],
    ['2100-03-01', 'Monday'],
    ['1000-01-01', 'Wednesday'],
    ['9999-12-31', 'Friday'],
  ])('%s is a %s', (date, weekday) => {
    expect(run(date).weekday).toBe(weekday);
  });

  it('marks weekends', () => {
    expect(run('2026-11-07').isWeekend).toBe(true);
    expect(run('2026-11-08').isWeekend).toBe(true);
    expect(run('2026-11-09').isWeekend).toBe(false);
  });
});

describe('date details', () => {
  it('handles a leap day', () => {
    expect(run('2024-02-29')).toMatchObject({ dayOfYear: 60, daysInYear: 366, isLeapYear: true, daysInMonth: 29 });
  });

  it('handles a common year', () => {
    expect(run('2023-02-28')).toMatchObject({ dayOfYear: 59, daysInYear: 365, isLeapYear: false, daysInMonth: 28 });
  });

  it('handles century years', () => {
    expect(run('1900-02-01')).toMatchObject({ isLeapYear: false, daysInMonth: 28 });
    expect(run('2000-02-01')).toMatchObject({ isLeapYear: true, daysInMonth: 29 });
  });

  it('gives the ISO week, including the neighbouring year', () => {
    expect(run('2026-11-03')).toMatchObject({ week: 45, weekYear: 2026 });
    expect(run('2021-01-01')).toMatchObject({ week: 53, weekYear: 2020 });
  });

  it('describes past and future dates', () => {
    expect(run('2026-11-03').relative).toBe('Today');
    expect(run('2026-11-04').relative).toBe('Tomorrow');
    expect(run('2026-11-02').relative).toBe('Yesterday');
    expect(run('2026-11-13').relative).toBe('10 days from today');
    expect(run('2025-11-03').relative).toBe('365 days ago');
    expect(describeRelative(2)).toBe('2 days from today');
  });
});

describe('validation', () => {
  it('requires a real date', () => {
    expect(evaluate('', TODAY).errors.date).toBe('Please choose a date.');
    expect(evaluate('2023-02-29', TODAY).errors.date).toMatch(/real date/);
    expect(evaluate('0999-01-01', TODAY).errors.date).toMatch(/real date/);
  });
});

describe('text', () => {
  it('builds copied text', () => {
    const text = buildResultText(run('2024-02-29'));
    expect(text).toContain('29 Feb 2024 is a Thursday');
    expect(text).toContain('Day 60 of 366');
    expect(text).toContain('Leap year: Yes');
  });

  it('has examples that match real results', () => {
    expect(examples[0].text).toContain(run('2026-11-03').weekday);
    expect(examples[1].text).toContain(run('2024-02-29').weekday);
    expect(examples[2].text).toContain(run('2000-01-01').weekday);
  });
});
