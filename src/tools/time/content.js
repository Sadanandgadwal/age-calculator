export const howItWorks = [
  { title: 'Choose a calculation', text: 'Add or subtract amounts of time, compare two clock times, or find the time before or after a duration.' },
  { title: 'Enter your times', text: 'Use hours, minutes and seconds for durations. Blank parts count as zero, and clock times use the time picker.' },
  { title: 'Read the result', text: 'See the result in hours, minutes and seconds, along with total hours, minutes and seconds.' },
];

export const formulas = [
  { title: 'Total seconds', text: 'Total seconds = hours × 3,600 + minutes × 60 + seconds' },
  { title: 'Time between', text: 'Difference = end time − start time, plus 24 hours if the end time is on the next day.' },
  { title: 'Converting back', text: 'Hours = total seconds ÷ 3,600. Minutes and seconds come from what is left over.' },
];

export const examples = [
  { title: 'Adding time', text: '1 hour 45 minutes + 30 minutes = 2 hours 15 minutes.' },
  { title: 'Overnight shift', text: 'From 10:00 PM to 6:00 AM is 8 hours.' },
  { title: 'Time after', text: '11:30 PM + 1 hour = 12:30 AM on the next day.' },
];

export const faqs = [
  {
    question: 'What if the end time is earlier than the start time?',
    answer: 'The end time is treated as the next day, so 10:00 PM to 6:00 AM counts as 8 hours. The result points this out when it happens.',
  },
  {
    question: 'Can I enter more than 60 minutes?',
    answer: 'Yes. Entries such as 90 minutes are accepted and converted, so the result shows 1 hour and 30 minutes.',
  },
  {
    question: 'Can the result be negative?',
    answer: 'Yes. Subtracting a longer time from a shorter one gives a negative result, shown with a minus sign.',
  },
  {
    question: 'Does this account for daylight saving time?',
    answer: 'No. Clock times are treated as a plain 24-hour day, so changes for daylight saving or time zones are not included.',
  },
];
