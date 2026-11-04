export const howItWorks = [
  { title: 'Start timing', text: 'Select Start to begin. Pause holds the time, and Resume continues from where you stopped.' },
  { title: 'Record laps', text: 'Select Lap while it is running to record each split without stopping the clock.' },
  { title: 'Clear or reset', text: 'Clear laps removes only the lap list. Reset returns the time to zero and clears the laps too.' },
];

export const formulas = [
  { title: 'Elapsed time', text: 'Elapsed time = time banked from earlier runs + (current time − last start time)' },
  { title: 'Lap time', text: 'Lap time = total time at this lap − total time at the previous lap' },
  { title: 'Display', text: 'Time shows as hours : minutes : seconds . hundredths of a second' },
];

export const examples = [
  { title: 'Running laps', text: 'Laps at 1:30 and 3:10 total time give lap times of 1:30 and 1:40.' },
  { title: 'Pausing', text: 'Run for 10 seconds, pause for a minute, then run for 5 more. The stopwatch shows 15 seconds.' },
  { title: 'Long sessions', text: 'Time keeps counting past 60 minutes, so 1 hour 5 minutes shows as 01:05:00.00.' },
];

export const faqs = [
  {
    question: 'How accurate is this stopwatch?',
    answer: 'It measures time from your device clock instead of adding up ticks, so it does not drift. The display updates about 20 times a second, and your reaction time still affects when you press the buttons.',
  },
  {
    question: 'Does it keep running in a background tab?',
    answer: 'Yes. Browsers may slow the display in a background tab, but the correct time appears as soon as you return.',
  },
  {
    question: 'Are my times saved?',
    answer: 'No. Times and laps stay on the page only, so they are lost when you reload or close it. Use Copy results to keep your laps.',
  },
  {
    question: 'Is there a limit on laps?',
    answer: 'There is no set limit. Laps are listed with the newest first.',
  },
];
