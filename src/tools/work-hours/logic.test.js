import { describe, expect, it } from 'vitest';
import { buildResultText, evaluate, formatHours } from './logic.js';

const run = (clockIn, clockOut, breakMinutes = '', standardHours = '8') => evaluate({ clockIn, clockOut, breakMinutes, standardHours });
const hours = (h, m = 0) => h * 3600 + m * 60;

describe('calculateWorkHours', () => {
  it('calculates a day shift with a break', () => {
    expect(run('09:00', '18:00', '60').result).toMatchObject({ shift: hours(9), breakSeconds: hours(1), net: hours(8), overtime: 0, shortfall: 0, isOvernight: false, decimalHours: 8 });
  });

  it('calculates overtime', () => {
    expect(run('09:00', '20:00', '60').result).toMatchObject({ net: hours(10), overtime: hours(2), shortfall: 0 });
  });

  it('calculates a shortfall', () => {
    expect(run('09:00', '14:00').result).toMatchObject({ net: hours(5), overtime: 0, shortfall: hours(3) });
  });

  it('uses configurable daily hours', () => {
    expect(run('09:00', '18:00', '', '6').result.overtime).toBe(hours(3));
    expect(run('09:00', '18:00', '', '7.5').result.overtime).toBe(hours(1, 30));
    expect(run('09:00', '18:00', '', '0').result.overtime).toBe(hours(9));
    expect(run('09:00', '18:00', '', '24').result.shortfall).toBe(hours(15));
  });

  it('supports overnight shifts', () => {
    expect(run('22:00', '06:00', '30').result).toMatchObject({ isOvernight: true, shift: hours(8), net: hours(7, 30), decimalHours: 7.5 });
    expect(run('23:59', '00:01').result).toMatchObject({ isOvernight: true, shift: 120 });
  });

  it('treats a blank break as zero, and allows part minutes', () => {
    expect(run('09:00', '17:00').result.breakSeconds).toBe(0);
    expect(run('09:00', '17:00', '0').result.breakSeconds).toBe(0);
    expect(run('09:00', '17:00', '7.5').result.breakSeconds).toBe(450);
  });

  it('includes seconds', () => {
    expect(run('09:00:00', '09:00:45').result.shift).toBe(45);
  });
});

describe('formatHours', () => {
  it.each([
    [0, '0 h 0 min'],
    [3600, '1 h 0 min'],
    [27000, '7 h 30 min'],
    [45, '0 h 0 min 45 s'],
    [3661, '1 h 1 min 1 s'],
  ])('formats %s seconds as %s', (seconds, text) => {
    expect(formatHours(seconds)).toBe(text);
  });
});

describe('validation', () => {
  it('requires both times', () => {
    expect(run('', '').errors).toEqual({ clockIn: 'Please choose a clock-in time.', clockOut: 'Please choose a clock-out time.' });
  });

  it('rejects invalid and identical times', () => {
    expect(run('25:00', '18:00').errors.clockIn).toBe('Please enter a valid time.');
    expect(run('09:00', '09:00').errors.clockOut).toBe("Clock-out can't be the same as clock-in.");
  });

  it('rejects an invalid break', () => {
    expect(run('09:00', '18:00', '-1').errors.breakMinutes).toBe("The break can't be negative.");
    expect(run('09:00', '18:00', 'abc').errors.breakMinutes).toMatch(/valid number/);
  });

  it('requires the break to be shorter than the shift', () => {
    expect(run('09:00', '10:00', '60').errors.breakMinutes).toBe('The break must be shorter than the shift.');
    expect(run('09:00', '10:00', '90').errors.breakMinutes).toBe('The break must be shorter than the shift.');
    expect(run('09:00', '10:00', '59').result.net).toBe(60);
  });

  it('checks the daily hours', () => {
    expect(run('09:00', '18:00', '', '').errors.standardHours).toBe('Please enter your daily working hours.');
    expect(run('09:00', '18:00', '', '25').errors.standardHours).toBe('Daily hours must be from 0 to 24.');
    expect(run('09:00', '18:00', '', '-1').errors.standardHours).toBe('Daily hours must be from 0 to 24.');
  });
});

describe('buildResultText', () => {
  it('summarises the shift', () => {
    const text = buildResultText(run('22:00', '06:00', '30').result);
    expect(text).toContain('Clock in: 10:00 PM');
    expect(text).toContain('Clock out: 6:00 AM (next day)');
    expect(text).toContain('Net working hours: 7 h 30 min (7.5 hours)');
    expect(text).toContain('Overtime: 0 h 0 min');
  });
});
