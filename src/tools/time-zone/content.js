export const howItWorks = [
  { title: 'Enter a date and time', text: 'Choose the date and time in the time zone you are converting from.' },
  { title: 'Choose your time zones', text: 'Pick from major countries and cities, or swap the two zones with one click.' },
  { title: 'See the result', text: 'Get the converted time, date and day, along with both UTC offsets and the time difference.' },
];

export const formulas = [
  { title: 'Converting', text: 'Destination time = source time − source UTC offset + destination UTC offset' },
  { title: 'UTC offset', text: 'A zone\'s offset is how far its local time is ahead of or behind UTC on that date.' },
  { title: 'Daylight saving', text: 'Offsets are looked up for the chosen date, so clock changes are included automatically.' },
];

export const examples = [
  { title: 'India to New York, winter', text: '12:00 PM IST on 15 Jan 2026 is 1:30 AM EST on the same day.' },
  { title: 'India to New York, summer', text: '12:00 PM IST on 15 Jul 2026 is 2:30 AM EDT, as New York moves forward an hour.' },
  { title: 'India to UAE', text: '12:00 PM IST is 10:30 AM in Dubai, which is 1 hour 30 minutes behind India.' },
];

export const faqs = [
  {
    question: 'Does this handle daylight saving time?',
    answer: 'Yes. Offsets come from your browser\'s time zone data for the chosen date. If a time is skipped or repeated when the clocks change, the result explains how it was handled.',
  },
  {
    question: 'What is the difference between GMT and UTC?',
    answer: 'For everyday use they show the same time. UTC is the modern time standard, while GMT is the time zone based on it. Note that the UK uses GMT only in winter, so choose London for local UK time.',
  },
  {
    question: 'What do EST and EDT mean?',
    answer: 'EST is Eastern Standard Time (UTC−05:00) and EDT is Eastern Daylight Time (UTC−04:00). Similarly, PST is UTC−08:00 and PDT is UTC−07:00. The correct one is chosen from the date.',
  },
  {
    question: 'Why is the date limited?',
    answer: 'Dates from 1900 to 2100 are accepted. Time zones were not standardised in the same way before then, and future rules may change, so future results are estimates.',
  },
];
