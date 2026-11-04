export const howItWorks = [
  { title: 'Choose a date', text: 'Pick any date, past or future, from the year 1000 onward.' },
  { title: 'Find the day', text: 'See which day of the week it falls on, and whether it is a weekday or weekend.' },
  { title: 'See the details', text: 'Get the day of the year, ISO week number, month length and how far it is from today.' },
];

export const formulas = [
  { title: 'Weekday', text: 'Weekday = days counted from a known date, divided by 7, using the remainder.' },
  { title: 'Day of the year', text: 'Day of the year = days since 1 January + 1' },
  { title: 'Leap years', text: 'A year is a leap year if it divides by 4, except century years, which must divide by 400.' },
];

export const examples = [
  { title: 'Today\'s reference', text: '3 November 2026 is a Tuesday.' },
  { title: 'A leap day', text: '29 February 2024 was a Thursday, and day 60 of 366.' },
  { title: 'Start of the century', text: '1 January 2000 was a Saturday.' },
];

export const faqs = [
  {
    question: 'Which day was I born on?',
    answer: 'Enter your date of birth and the result shows the weekday. The Age Calculator also shows this along with your exact age.',
  },
  {
    question: 'Does this work for old dates?',
    answer: 'It uses the modern Gregorian calendar for all dates. Many countries used a different calendar before it was adopted, from 1582 onward, so very old dates may not match historical records.',
  },
  {
    question: 'How does it handle leap years?',
    answer: 'Real calendar lengths are used, including 29 February in leap years and the century rule, so 1900 was not a leap year but 2000 was.',
  },
  {
    question: 'What is the ISO week number?',
    answer: 'ISO weeks start on Monday, and week 1 is the week containing the first Thursday of the year. Dates near New Year can belong to a week of the neighbouring year.',
  },
];
