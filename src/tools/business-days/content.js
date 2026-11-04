export const howItWorks = [
  { title: 'Choose your dates', text: 'Pick the start and end dates, then decide whether the end date counts as a day.' },
  { title: 'Set your weekend', text: 'Saturday and Sunday are selected by default. Change them to match your working week.' },
  { title: 'Add holidays', text: 'Add any dates off, such as public holidays. They are removed from the working days.' },
];

export const formulas = [
  { title: 'Working days', text: 'Working days = calendar days − weekend days − holidays on working days' },
  { title: 'Calendar days', text: 'Calendar days = end date − start date, plus 1 if the end date is counted' },
  { title: 'Holidays on a weekend', text: 'A holiday on a weekend day counts only as a weekend day, so it is not removed twice.' },
];

export const examples = [
  { title: 'A working week', text: 'Monday 2 Nov 2026 to Friday 6 Nov 2026 is 5 working days when the end date is counted.' },
  { title: 'With a holiday', text: 'The same week with a holiday on Wednesday 4 Nov 2026 is 4 working days.' },
  { title: 'A six-day week', text: 'With only Sunday as the weekend, 2 Nov to 8 Nov 2026 has 6 working days.' },
];

export const faqs = [
  {
    question: 'Are public holidays included automatically?',
    answer: 'No. Holidays differ by country, state and employer, so add the dates that apply to you.',
  },
  {
    question: 'Should I count the end date?',
    answer: 'Count it when the last day is worked, such as a leave period or project schedule. Turn it off to measure the time between two dates.',
  },
  {
    question: 'Can my weekend be different days?',
    answer: 'Yes. Choose any days, such as Friday and Saturday, or a single day for a six-day week.',
  },
  {
    question: 'How is this different from the Date Calculator?',
    answer: 'The Date Calculator counts Monday to Friday as business days. This tool also lets you set your own weekend and exclude holidays.',
  },
];
