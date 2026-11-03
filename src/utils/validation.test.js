import { describe, expect, it } from 'vitest';
import { MESSAGES, validateDates } from './validation.js';

const today = '2026-11-03';

describe('validateDates', () => {
  it('accepts valid dates', () => {
    expect(validateDates({ dob: '1998-06-15', asOf: today, today })).toEqual({});
  });

  it('requires a date of birth', () => {
    expect(validateDates({ dob: '', asOf: today, today })).toEqual({ dob: MESSAGES.dobRequired });
  });

  it('requires a calculation date', () => {
    expect(validateDates({ dob: '1998-06-15', asOf: '', today })).toEqual({ asOf: MESSAGES.asOfRequired });
  });

  it('rejects a future date of birth', () => {
    const errors = validateDates({ dob: '2026-11-04', asOf: '2030-01-01', today });
    expect(errors).toEqual({ dob: MESSAGES.dobInFuture });
  });

  it('accepts a date of birth of today', () => {
    expect(validateDates({ dob: today, asOf: today, today })).toEqual({});
  });

  it('rejects a calculation date before the date of birth', () => {
    const errors = validateDates({ dob: '2000-01-02', asOf: '2000-01-01', today });
    expect(errors).toEqual({ asOf: MESSAGES.asOfBeforeDob });
  });

  it('allows a future calculation date', () => {
    expect(validateDates({ dob: '1998-06-15', asOf: '2050-01-01', today })).toEqual({});
  });

  it('rejects impossible dates', () => {
    expect(validateDates({ dob: '2023-02-29', asOf: today, today })).toEqual({ dob: MESSAGES.invalid });
    expect(validateDates({ dob: '1998-06-15', asOf: '2023-04-31', today })).toEqual({ asOf: MESSAGES.invalid });
  });

  it('rejects years before 1000, such as a partly typed year', () => {
    expect(validateDates({ dob: '0199-06-15', asOf: today, today })).toEqual({ dob: MESSAGES.invalid });
  });

  it('reports a partly typed date as incomplete instead of missing', () => {
    expect(validateDates({ dob: '', dobIncomplete: true, asOf: today, today })).toEqual({
      dob: MESSAGES.incomplete,
    });
    expect(validateDates({ dob: '1998-06-15', asOf: '', asOfIncomplete: true, today })).toEqual({
      asOf: MESSAGES.incomplete,
    });
  });

  it('reports both fields when both are invalid', () => {
    expect(validateDates({ dob: '', asOf: '', today })).toEqual({
      dob: MESSAGES.dobRequired,
      asOf: MESSAGES.asOfRequired,
    });
  });
});
