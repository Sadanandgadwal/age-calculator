export const howItWorks = [
  { title: 'Choose a date', text: 'Pick any date to find the ISO week it belongs to.' },
  { title: 'Get the week number', text: 'See the week number, the year it belongs to and the weekday of your date.' },
  { title: 'See the full week', text: 'Get the Monday and Sunday that start and end the week, plus its standard week code.' },
];

export const formulas = [
  { title: 'Week start', text: 'ISO weeks run from Monday to Sunday.' },
  { title: 'Week 1', text: 'Week 1 is the week containing the first Thursday of the year, which always includes 4 January.' },
  { title: 'Week number', text: 'Week number = (day of the year of that week\'s Thursday − 1) ÷ 7, rounded down, + 1' },
];

export const examples = [
  { title: 'A mid-year date', text: '3 November 2026 is in week 45 of 2026, which runs from 2 Nov to 8 Nov.' },
  { title: 'Belonging to the previous year', text: '1 January 2021 is in week 53 of 2020.' },
  { title: 'Belonging to the next year', text: '30 December 2024 is in week 1 of 2025.' },
];

export const faqs = [
  {
    question: 'What is an ISO week number?',
    answer: 'It comes from the international ISO 8601 standard. Weeks start on Monday, and each year has 52 or 53 of them.',
  },
  {
    question: 'Why can a date in January belong to last year\'s week?',
    answer: 'A week belongs to the year that contains its Thursday. If 1 January falls on a Friday, Saturday or Sunday, those days are part of the last week of the previous year.',
  },
  {
    question: 'Which years have 53 weeks?',
    answer: 'A year has 53 ISO weeks when it starts on a Thursday, or is a leap year that starts on a Wednesday. 2020 and 2026 are examples.',
  },
  {
    question: 'Why might my calendar show a different week number?',
    answer: 'Some calendars, especially in the US, start weeks on Sunday and count week 1 from 1 January. This tool always uses the ISO standard.',
  },
];
