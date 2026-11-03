import { useState } from 'react';
import { calculateAge } from '../utils/age.js';
import { getTodayIso, toIsoDate } from '../utils/date.js';
import { validateDates } from '../utils/validation.js';

const withoutKey = (object, key) => {
  const copy = { ...object };
  delete copy[key];
  return copy;
};

/** Owns the calculator's form state and connects it to the validation and age logic. */
export function useAgeCalculator() {
  const [dob, setDobValue] = useState('');
  const [asOf, setAsOfValue] = useState(getTodayIso);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const setDob = (value) => {
    setDobValue(value);
    setErrors((current) => withoutKey(current, 'dob'));
  };

  const setAsOf = (value) => {
    setAsOfValue(value);
    setErrors((current) => withoutKey(current, 'asOf'));
  };

  /** Returns the validation errors so the form can move focus to the first invalid field. */
  const calculate = ({ dobIncomplete = false, asOfIncomplete = false } = {}) => {
    const nextErrors = validateDates({
      dob,
      asOf,
      today: getTodayIso(),
      dobIncomplete,
      asOfIncomplete,
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setResult(null);
      return nextErrors;
    }

    setResult(calculateAge(dob, asOf));
    return nextErrors;
  };

  const reset = () => {
    setDobValue('');
    setAsOfValue(getTodayIso());
    setErrors({});
    setResult(null);
  };

  // A result stays visible while the dates are edited, labelled with the dates it used.
  const isStale =
    result !== null && (toIsoDate(result.birthDate) !== dob || toIsoDate(result.asOfDate) !== asOf);

  return { dob, asOf, errors, result, isStale, setDob, setAsOf, calculate, reset };
}
