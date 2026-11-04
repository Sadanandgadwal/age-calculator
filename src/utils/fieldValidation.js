import { parseDecimal } from './number.js';

export function checkNumber(text, { required = 'Please enter a value.', min = 0, max = Infinity, aboveMin = false, whole = false, minMessage, maxMessage } = {}) {
  if (!String(text ?? '').trim()) return { error: required };

  const value = parseDecimal(text);
  if (value === null) return { error: 'Please enter a valid number, without commas or symbols.' };
  if (value < min || (aboveMin && value === min)) {
    return { error: minMessage ?? (aboveMin ? `Please enter a value greater than ${min}.` : `Please enter a value of ${min} or more.`) };
  }
  if (value > max) return { error: maxMessage ?? `Please enter a value of ${max} or less.` };
  if (whole && !Number.isInteger(value)) return { error: 'Please enter a whole number.' };

  return { value };
}

export function collectFields(fields) {
  const errors = {};
  const values = {};
  for (const [name, field] of Object.entries(fields)) {
    if (field.error) errors[name] = field.error;
    else values[name] = field.value;
  }
  return { errors, values, isValid: Object.keys(errors).length === 0 };
}
