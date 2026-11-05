export const howItWorks = [
  { title: 'Add your text', text: 'Type or paste your text. The count updates with every character.' },
  { title: 'Set a limit if you need one', text: 'Enter a limit, such as the one on a form or social post, to see how much room is left.' },
  { title: 'See what it is made of', text: 'Check how many characters are letters, digits, spaces and symbols.' },
];

export const formulas = [
  { title: 'Characters', text: 'Every visible character, space and line break counts as one.' },
  { title: 'Without spaces', text: 'The same count, leaving out spaces, tabs and line breaks.' },
  { title: 'Characters left', text: 'Your limit − characters. A negative result is shown as the amount over the limit.' },
];

export const examples = [
  { title: '“Hello world”', text: '11 characters, or 10 without the space.' },
  { title: 'With an emoji', text: '“Hi 😀” is 4 characters, as the emoji counts as one.' },
  { title: 'A limit of 160', text: 'A message of 170 characters shows as 10 over the limit.' },
];

export const faqs = [
  {
    question: 'Do spaces count as characters?',
    answer: 'Yes in the main count, as most forms and social sites count them. The Without Spaces figure leaves them out.',
  },
  {
    question: 'How are emoji counted?',
    answer: 'Each emoji you see counts as one, even when it is stored as several code units. Some sites count them as two, so your total there may be higher.',
  },
  {
    question: 'Does a line break count?',
    answer: 'Yes, each line break counts as one character, and is included under Spaces and Line Breaks.',
  },
  {
    question: 'Is my text saved?',
    answer: 'No. The text stays in your browser and is gone when you close or clear the page.',
  },
];
