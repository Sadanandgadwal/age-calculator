export const howItWorks = [
  { title: 'Set your range', text: 'Enter the lowest and highest numbers you want. Both can be picked.' },
  { title: 'Choose how many', text: 'Pick up to 1,000 numbers, and decide whether repeats are allowed.' },
  { title: 'Generate', text: 'Select Generate for your numbers, and select it again for a new set.' },
];

export const formulas = [
  { title: 'Equal chances', text: 'Each number in the range has the same chance, using your browser’s secure random generator with no rounding bias.' },
  { title: 'Numbers in a range', text: 'Highest − lowest + 1. So 1 to 100 has 100 possible numbers.' },
  { title: 'No repeats', text: 'Each number can be picked once. So you can ask for no more numbers than the range has.' },
];

export const examples = [
  { title: 'Pick a raffle winner', text: 'With 250 tickets, use 1 to 250 and pick 1 number.' },
  { title: 'Roll two dice', text: 'Use 1 to 6, pick 2 numbers, with repeats allowed.' },
  { title: 'Choose a sample', text: 'To survey 20 of 500 people, use 1 to 500, pick 20, with no repeats.' },
];

export const faqs = [
  {
    question: 'Are the numbers truly random?',
    answer: 'They come from your browser’s cryptographic random generator, which is suitable for fair draws. They are not suitable for regulated lotteries, which have their own requirements.',
  },
  {
    question: 'Can I use negative numbers?',
    answer: 'Yes. For example, you can pick from −10 to 10.',
  },
  {
    question: 'Are the numbers saved?',
    answer: 'No. They are created in your browser and are gone when you leave the page.',
  },
];
