import { parseDate, toDayNumber } from './date.js';

export const MESSAGES = {
  dobRequired: 'Please enter your date of birth.',
  asOfRequired: 'Please choose the date to calculate your age on.',
  incomplete: 'That date looks incomplete. Please enter a valid day, month and year.',
  invalid: 'Please enter a real date with a year from 1000 onward.',
  dobInFuture: "Your date of birth can't be in the future.",
  asOfBeforeDob: "This date can't be earlier than your date of birth.",
};

function checkField(value, { requiredMessage, isIncomplete }) {
  if (isIncomplete) return MESSAGES.incomplete;
  if (!value) return requiredMessage;
  if (!parseDate(value)) return MESSAGES.invalid;
  return undefined;
}

/**
 * Validates the form. Returns an object holding a message for each invalid
 * field, which is empty when everything is valid.
 *
 * `dobIncomplete` and `asOfIncomplete` report a partly typed date. Browsers give
 * an empty value in that case, so it would otherwise look like an untouched field.
 */
export function validateDates({ dob, asOf, today, dobIncomplete = false, asOfIncomplete = false }) {
  const errors = {};

  const dobError = checkField(dob, {
    requiredMessage: MESSAGES.dobRequired,
    isIncomplete: dobIncomplete,
  });
  const asOfError = checkField(asOf, {
    requiredMessage: MESSAGES.asOfRequired,
    isIncomplete: asOfIncomplete,
  });

  if (dobError) errors.dob = dobError;
  if (asOfError) errors.asOf = asOfError;

  if (!dobError && toDayNumber(parseDate(dob)) > toDayNumber(parseDate(today))) {
    errors.dob = MESSAGES.dobInFuture;
  }

  if (!dobError && !asOfError && toDayNumber(parseDate(asOf)) < toDayNumber(parseDate(dob))) {
    errors.asOf = MESSAGES.asOfBeforeDob;
  }

  return errors;
}
