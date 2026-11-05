export const howItWorks = [
  { title: 'Choose how many', text: 'Keep it at 1 for a quick decision, or flip up to 1,000 coins at once.' },
  { title: 'Select Flip', text: 'See heads or tails straight away. Select Flip again for a new result.' },
  { title: 'Check the totals', text: 'For several flips, see how many heads and tails came up, and every flip in order.' },
];

export const formulas = [
  { title: 'Fair odds', text: 'Each flip has a 50% chance of heads and a 50% chance of tails, whatever came before.' },
  { title: 'Randomness', text: 'Each flip uses your browser’s secure random number generator with no rounding bias.' },
  { title: 'Share', text: 'Heads share = number of heads ÷ number of flips × 100.' },
];

export const examples = [
  { title: 'Settle a choice', text: 'Agree who takes heads and who takes tails first, then flip once.' },
  { title: 'See probability at work', text: '10 flips can easily give 7 heads, while 1,000 flips usually land close to 50%.' },
  { title: 'Teach a class', text: 'Run 100 flips several times and compare how the totals vary.' },
];

export const faqs = [
  {
    question: 'Is this coin really fair?',
    answer: 'Yes. The odds are 50/50 on every flip, using secure randomness. A real coin can be very slightly biased, but this one is not weighted either way.',
  },
  {
    question: 'I got heads five times in a row. Is something wrong?',
    answer: 'No. A run of five happens about once in every 16 sets of five flips for a given side. Each flip is independent, so past results do not change the next one.',
  },
  {
    question: 'Are my results saved?',
    answer: 'No. They stay on this page, and are gone when you leave it.',
  },
];
