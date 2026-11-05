export const howItWorks = [
  { title: 'Choose a direction', text: 'Convert a Unix timestamp into a readable date, or a date into a timestamp.' },
  { title: 'Enter your value', text: 'Choose seconds or milliseconds for timestamps, and local time or UTC for dates.' },
  { title: 'Copy the result', text: 'See UTC, local and ISO 8601 times together, then copy them in one click.' },
];

export const formulas = [
  { title: 'Unix time', text: 'Unix time = seconds since 1 January 1970, 00:00:00 UTC' },
  { title: 'Seconds to milliseconds', text: 'Milliseconds = seconds × 1,000' },
  { title: 'Dates before 1970', text: 'Dates before 1 January 1970 have negative timestamps.' },
];

export const examples = [
  { title: 'The start of Unix time', text: '0 is Thu, 01 Jan 1970 00:00:00 GMT.' },
  { title: 'A recent timestamp', text: '1700000000 is Tue, 14 Nov 2023 22:13:20 GMT.' },
  { title: 'Milliseconds', text: '1700000000000 milliseconds is the same moment as 1700000000 seconds.' },
];

export const faqs = [
  {
    question: 'What is a Unix timestamp?',
    answer: 'It is the number of seconds since 1 January 1970 at midnight UTC. It is widely used in software because it is a single number that does not depend on time zones.',
  },
  {
    question: 'How can I tell seconds from milliseconds?',
    answer: 'Timestamps for current dates have 10 digits in seconds and 13 digits in milliseconds. The result shows a reminder if your number looks like the other unit.',
  },
  {
    question: 'Which time zone does local time use?',
    answer: 'It uses the time zone set on your device. The timestamp itself is the same everywhere, and only the displayed date and time change.',
  },
  {
    question: 'What is the supported range?',
    answer: 'Timestamps can be up to 8.64 quadrillion milliseconds either side of 1970, the limit of JavaScript dates. Dates you enter use years from 1000 to 9999.',
  },
];
