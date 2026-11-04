export const howItWorks = [
  { title: 'Start a focus session', text: 'Work on one task for 25 minutes. Pause or reset at any time.' },
  { title: 'Take a break', text: 'When a session ends, the next one is selected for you. Select Start when you are ready.' },
  { title: 'Repeat', text: 'After every 4 focus sessions, the timer moves to a long break instead of a short one.' },
];

export const formulas = [
  { title: 'Default lengths', text: 'Focus 25 minutes, short break 5 minutes, long break 15 minutes' },
  { title: 'A full cycle', text: '4 focus sessions + 3 short breaks + 1 long break = 130 minutes' },
  { title: 'Time remaining', text: 'Time remaining = session length − time elapsed' },
];

export const examples = [
  { title: 'Standard', text: '25 minutes of focus, then a 5 minute break, repeated four times with a 15 minute long break.' },
  { title: 'Deep work', text: 'Set focus to 50 minutes and short breaks to 10 minutes for longer tasks.' },
  { title: 'Getting started', text: 'Set focus to 10 minutes on days when a task feels hard to start.' },
];

export const faqs = [
  {
    question: 'What is the Pomodoro Technique?',
    answer: 'It is a time management method that splits work into focused sessions separated by short breaks, with a longer break after several sessions.',
  },
  {
    question: 'Can I change the session lengths?',
    answer: 'Yes. Each can be from 1 to 180 minutes. A new length applies the next time that session starts, not to one already running.',
  },
  {
    question: 'Does the timer play a sound?',
    answer: 'No. It shows a message when a session ends, and waits for you to start the next one.',
  },
  {
    question: 'Are my completed sessions saved?',
    answer: 'No. The count stays on the page only, so it returns to zero when you reload or close it.',
  },
];
