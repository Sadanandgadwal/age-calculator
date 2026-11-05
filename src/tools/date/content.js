export const howItWorks = [
  { title: 'Choose a calculation', text: 'Count the days between dates, move a date forward or back, or count business days and weekends.' },
  { title: 'Enter your dates', text: 'Pick your dates and, for date arithmetic, enter a number of days, months or years.' },
  { title: 'Decide on the end date', text: 'For date ranges, choose whether the end date counts as a day. The results update straight away.' },
];

export const formulas = [
  { title: 'Days between dates', text: 'Days = end date − start date, plus 1 if the end date is included.' },
  { title: 'Business days', text: 'Business days = days in the range that fall from Monday to Friday.' },
  { title: 'Adding months', text: 'Add the months, then use the last day of the month if the original day does not exist in it.' },
];

export const examples = [
  { title: 'Days between', text: '1 Jan 2026 to 1 Mar 2026 is 59 days, and 1 Jan 2024 to 1 Mar 2024 is 60 days because 2024 is a leap year.' },
  { title: 'Month ends', text: '31 Jan 2026 + 1 month = 28 Feb 2026, as February 2026 has no 31st.' },
  { title: 'Business days', text: 'Monday 2 Nov 2026 to Friday 6 Nov 2026 is 5 business days when the end date is included.' },
];

export const faqs = [
  {
    question: 'Should I include the end date?',
    answer:
      'Include it when the last day counts, such as a leave period or an event. Leave it out to measure the time between two dates. For example, 1 to 2 January is 1 day apart, or 2 days when both are counted.',
  },
  {
    question: 'Do business days include public holidays?',
    answer: 'Business days here means Monday to Friday. Public holidays vary by region and are not removed, so subtract any that apply to you.',
  },
  {
    question: 'What happens when I add a month to 31 January?',
    answer: 'The result is the last day of February, because February has no 31st. The results point this out when it happens.',
  },
  {
    question: 'Does this handle leap years?',
    answer: 'Yes. Real calendar lengths are used, including 29 February in leap years and the century rule, so 1900 was not a leap year but 2000 was.',
  },
];
