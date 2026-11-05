export const howItWorks = [
  { title: 'Enter a year', text: 'Type any year from 1 to 9999.' },
  { title: 'Get the answer', text: 'See whether it is a leap year, with a plain explanation of the rule that decides it.' },
  { title: 'Find nearby leap years', text: 'See the next and previous leap years, plus the days in that year and in February.' },
];

export const formulas = [
  { title: 'Rule 1', text: 'A year that divides evenly by 4 is a leap year.' },
  { title: 'Rule 2', text: 'Except a century year, one that divides evenly by 100, which is not a leap year.' },
  { title: 'Rule 3', text: 'Except a century year that also divides evenly by 400, which is a leap year.' },
];

export const examples = [
  { title: '2024', text: 'A leap year, as it divides by 4 and is not a century year.' },
  { title: '1900', text: 'Not a leap year, as it is a century year that does not divide by 400.' },
  { title: '2000', text: 'A leap year, as it is a century year that divides by 400.' },
];

export const faqs = [
  {
    question: 'Why do we have leap years?',
    answer: 'A solar year is about 365.2422 days. Adding a day almost every four years keeps the calendar in step with the seasons.',
  },
  {
    question: 'Why are most century years not leap years?',
    answer: 'A leap day every four years adds slightly too much time. Skipping three leap days every 400 years corrects it, giving an average year of 365.2425 days.',
  },
  {
    question: 'Are leap years always four years apart?',
    answer: 'Usually, but not around skipped century years. For example, 1896 and 1904 are eight years apart, because 1900 was not a leap year.',
  },
  {
    question: 'Does this work for years before the calendar was adopted?',
    answer: 'It applies the Gregorian rules to all years. The Gregorian calendar began in 1582, so older years may differ from historical records.',
  },
];
