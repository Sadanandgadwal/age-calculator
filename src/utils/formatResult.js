import { formatDate } from './date.js';

const numberFormatter = new Intl.NumberFormat('en-GB');

export function formatNumber(value) {
  return numberFormatter.format(value);
}

/** Formats a count with its unit: "1 day", "10,368 days". */
export function pluralize(count, singular) {
  return `${formatNumber(count)} ${singular}${count === 1 ? '' : 's'}`;
}

export function formatCountdown({ isToday, daysUntil }) {
  return isToday ? 'Today!' : pluralize(daysUntil, 'day');
}

/** Plain-text summary used by the copy and share actions. */
export function buildResultText(result) {
  const { years, months, days, totalDays, totalWeeks, totalMonths, nextBirthday } = result;

  return [
    `Age on ${formatDate(result.asOfDate)}: ${pluralize(years, 'year')}, ${pluralize(months, 'month')}, ${pluralize(days, 'day')}`,
    `Born on: ${result.bornOnWeekday}, ${formatDate(result.birthDate)}`,
    `Total lived: ${pluralize(totalDays, 'day')}, ${pluralize(totalWeeks, 'week')}, ${pluralize(totalMonths, 'month')}`,
    `Next birthday: ${formatDate(nextBirthday.date)} (${formatCountdown(nextBirthday)})`,
  ].join('\n');
}

export function buildAgeReport(result) {
  const { nextBirthday } = result;
  const unit = (value, singular, plural) => ({ label: value === 1 ? singular : plural, value });
  return {
    inputs: [
      { label: 'Date of birth', value: formatDate(result.birthDate) },
      { label: 'Age on', value: formatDate(result.asOfDate) },
    ],
    results: [unit(result.years, 'Year', 'Years'), unit(result.months, 'Month', 'Months'), unit(result.days, 'Day', 'Days')],
    details: [
      { label: 'Total days lived', value: pluralize(result.totalDays, 'day') },
      { label: 'Total weeks lived', value: pluralize(result.totalWeeks, 'week') },
      { label: 'Total months lived', value: pluralize(result.totalMonths, 'month') },
      { label: 'Day of birth', value: result.bornOnWeekday },
      { label: 'Next birthday in', value: formatCountdown(nextBirthday) },
      { label: 'Next birthday on', value: formatDate(nextBirthday.date) },
    ],
    notes: nextBirthday.isObservedOnFeb28 ? [`Born on 29 February: ${nextBirthday.date.year} isn't a leap year, so the birthday is shown on 28 February.`] : null,
  };
}
