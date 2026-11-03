/** Copy for the "Useful information" section, kept apart from the markup. */
export const USEFUL_INFO = [
  {
    question: 'How is age calculated?',
    answer:
      'We count the full calendar months between your date of birth and the chosen date, then the days left over. Twelve full months make a year. Real month lengths and leap years are used, not an average.',
  },
  {
    question: 'How many days are in a year?',
    answer:
      'A common year has 365 days and a leap year has 366. Over the long run the calendar year averages 365.2425 days, which is why dividing by 365 gives inaccurate ages.',
  },
  {
    question: 'How do leap years affect age?',
    answer:
      'Leap years add 29 February, so they increase your total days lived. They do not change your age in years, as a year is counted from one birthday to the next.',
  },
];

export const FAQS = [
  {
    question: 'When is my birthday if I was born on 29 February?',
    answer:
      'This calculator shows it on 28 February in common years and 29 February in leap years. Some countries legally use 1 March instead, so check local rules for official purposes.',
  },
  {
    question: 'Can I calculate my age on a past or future date?',
    answer:
      'Yes. Change "Calculate Age As Of" to any date on or after your date of birth to see how old you were or will be on that day.',
  },
  {
    question: 'Why might another calculator show a different number of days?',
    answer:
      'When the birth day doesn\'t exist in the current month, such as the 31st in a 30-day month, calculators can differ. We use the last day of that month, then count on from there.',
  },
  {
    question: 'Are my dates stored anywhere?',
    answer:
      'No. The calculation runs entirely in your browser, and your dates are not sent to a server.',
  },
];
