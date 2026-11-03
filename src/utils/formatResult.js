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
