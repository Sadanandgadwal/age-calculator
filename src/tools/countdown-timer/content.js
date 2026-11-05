export const howItWorks = [
  { title: 'Name your event', text: 'Add an optional name, then choose the date and time you are counting down to.' },
  { title: 'Start the countdown', text: 'See the days, hours, minutes and seconds remaining, updated every moment.' },
  { title: 'Pause or reset', text: 'Pause holds the time left, and Resume continues from there. Reset lets you choose a new date.' },
];

export const formulas = [
  { title: 'Time remaining', text: 'Time remaining = target date and time − current date and time' },
  { title: 'Days', text: 'Days = total seconds remaining ÷ 86,400, rounded down' },
  { title: 'Hours and minutes', text: 'Hours and minutes come from the seconds left over after whole days.' },
];

export const examples = [
  { title: 'New Year', text: 'Set 1 January at 12:00 AM to count down to the new year.' },
  { title: 'Exam or deadline', text: 'Add the exam name and start time to see exactly how long is left.' },
  { title: 'Short timer', text: 'Choose today and a time later today for a countdown of a few minutes or hours.' },
];

export const faqs = [
  {
    question: 'What time zone does the countdown use?',
    answer: 'It uses the time zone set on your device, so the target date and time are treated as your local time.',
  },
  {
    question: 'What happens if I pause?',
    answer: 'The time left is held until you resume, so the countdown then ends later than the target you first chose.',
  },
  {
    question: 'Does it keep running if I close the page?',
    answer: 'No. The countdown is not saved, so you will need to set it up again when you come back.',
  },
  {
    question: 'What happens when the countdown ends?',
    answer: 'It stops at zero and shows that the event has been reached. It does not play a sound.',
  },
];
