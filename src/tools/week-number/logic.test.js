import { describe, expect, it } from 'vitest';
import { examples } from './content.js';
import { buildResultText, evaluate } from './logic.js';
import { toIsoDate } from '../../utils/date.js';

const run = (text) => evaluate(text).result;

describe('calculateWeek', () => {
  it('finds the week, weekday and bounds', () => {
    const result = run('2026-11-03');
    expect(result).toMatchObject({ week: 45, weekYear: 2026, weekday: 'Tuesday', label: '2026-W45', crossesYear: false, weeksInYear: 53 });
    expect(toIsoDate(result.start)).toBe('2026-11-02');
    expect(toIsoDate(result.end)).toBe('2026-11-08');
  });

  it('treats Sunday as the last day of the week', () => {
    expect(run('2026-11-08').week).toBe(45);
    expect(run('2026-11-09').week).toBe(46);
  });

  it.each([
    ['2021-01-01', 53, 2020, true],
    ['2021-01-03', 53, 2020, true],
    ['2021-01-04', 1, 2021, false],
    ['2024-12-30', 1, 2025, true],
    ['2024-12-29', 52, 2024, false],
    ['2020-12-31', 53, 2020, false],
    ['2026-12-31', 53, 2026, false],
    ['2027-01-01', 53, 2026, true],
    ['2023-01-01', 52, 2022, true],
    ['2015-01-01', 1, 2015, false],
  ])('%s is week %s of %s across a year: %s', (date, week, weekYear, crossesYear) => {
    expect(run(date)).toMatchObject({ week, weekYear, crossesYear });
  });

  it('pads single-digit weeks in the week code', () => {
    expect(run('2026-01-07').label).toBe('2026-W02');
  });

  it('knows how many weeks the year has', () => {
    expect(run('2021-06-01').weeksInYear).toBe(52);
    expect(run('2020-06-01').weeksInYear).toBe(53);
  });
});

describe('validation', () => {
  it('requires a real date', () => {
    expect(evaluate('').errors.date).toBe('Please choose a date.');
    expect(evaluate('2023-02-29').errors.date).toMatch(/real date/);
  });
});

describe('text', () => {
  it('builds copied text', () => {
    const text = buildResultText(run('2021-01-01'));
    expect(text).toContain('1 Jan 2021 (Friday) is in ISO week 53 of 2020');
    expect(text).toContain('Week code: 2020-W53');
    expect(text).toContain('Week start: 28 Dec 2020');
    expect(text).toContain('Week end: 3 Jan 2021');
  });

  it('has examples that match real results', () => {
    expect(examples[0].text).toContain('week 45 of 2026');
    expect(run('2026-11-03')).toMatchObject({ week: 45, weekYear: 2026 });
    expect(run('2021-01-01')).toMatchObject({ week: 53, weekYear: 2020 });
    expect(run('2024-12-30')).toMatchObject({ week: 1, weekYear: 2025 });
  });
});
