import { describe, expect, it } from 'vitest';
import { buildResultText, checkYear, evaluate, nextLeapYear, previousLeapYear } from './logic.js';

describe('checkYear', () => {
  it.each([
    [2024, true],
    [2023, false],
    [2028, true],
    [1900, false],
    [2000, true],
    [2100, false],
    [2400, true],
    [1600, true],
    [1700, false],
    [4, true],
    [1, false],
    [9996, true],
    [9999, false],
  ])('%s leap year: %s', (year, isLeap) => {
    expect(checkYear(year).isLeap).toBe(isLeap);
  });

  it('matches the real calendar', () => {
    for (let year = 1000; year <= 2500; year += 1) {
      const hasLeapDay = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1;
      expect(checkYear(year).isLeap, String(year)).toBe(hasLeapDay);
    }
  });

  it('gives the day counts', () => {
    expect(checkYear(2024)).toMatchObject({ daysInYear: 366, daysInFebruary: 29 });
    expect(checkYear(2023)).toMatchObject({ daysInYear: 365, daysInFebruary: 28 });
  });

  it('shows each rule check', () => {
    expect(checkYear(2000)).toMatchObject({ divisibleBy4: true, divisibleBy100: true, divisibleBy400: true });
    expect(checkYear(1900)).toMatchObject({ divisibleBy4: true, divisibleBy100: true, divisibleBy400: false });
    expect(checkYear(2024)).toMatchObject({ divisibleBy4: true, divisibleBy100: false, divisibleBy400: false });
    expect(checkYear(2023)).toMatchObject({ divisibleBy4: false, divisibleBy100: false, divisibleBy400: false });
  });

  it.each([
    [2024, 'divides evenly by 4 and is not a century year'],
    [2023, 'does not divide evenly by 4'],
    [1900, 'century year that does not divide evenly by 400'],
    [2000, 'century year that divides evenly by 400'],
  ])('explains %s', (year, text) => {
    expect(checkYear(year).explanation).toContain(text);
  });
});

describe('nearby leap years', () => {
  it('finds the next one, after the year itself', () => {
    expect(nextLeapYear(2024)).toBe(2028);
    expect(nextLeapYear(2025)).toBe(2028);
    expect(nextLeapYear(2023)).toBe(2024);
  });

  it('skips century years that are not leap years', () => {
    expect(nextLeapYear(1896)).toBe(1904);
    expect(nextLeapYear(2096)).toBe(2104);
    expect(previousLeapYear(1904)).toBe(1896);
  });

  it('includes century years that are', () => {
    expect(nextLeapYear(1996)).toBe(2000);
    expect(previousLeapYear(2004)).toBe(2000);
  });

  it('handles both ends of the range', () => {
    expect(previousLeapYear(2024)).toBe(2020);
    expect(previousLeapYear(4)).toBeNull();
    expect(previousLeapYear(1)).toBeNull();
    expect(previousLeapYear(5)).toBe(4);
    expect(nextLeapYear(9999)).toBe(10000);
  });
});

describe('evaluate', () => {
  it('accepts a valid year', () => {
    expect(evaluate('2024').result.isLeap).toBe(true);
    expect(evaluate(' 2024 ').result.year).toBe(2024);
  });

  it.each([
    ['', 'Please enter a year.'],
    ['0', 'Please enter a year from 1 to 9999.'],
    ['-4', 'Please enter a year from 1 to 9999.'],
    ['10000', 'Please enter a year from 1 to 9999.'],
    ['2024.5', 'Please enter a whole number.'],
    ['abc', 'Please enter a valid number, without commas or symbols.'],
  ])('rejects %j', (text, message) => {
    expect(evaluate(text).errors.year).toBe(message);
  });
});

describe('buildResultText', () => {
  it('summarises the result', () => {
    const text = buildResultText(checkYear(2024));
    expect(text).toContain('2024 is a leap year');
    expect(text).toContain('Next leap year: 2028');
    expect(text).toContain('Days in 2024: 366');
  });
});
