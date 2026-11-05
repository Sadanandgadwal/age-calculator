export const howItWorks = [
  { title: 'List your options', text: 'Put each option on its own line, and add your question if you like.' },
  { title: 'Favour some if you want', text: 'Add | and a number to give an option more chances, such as Pizza | 3.' },
  { title: 'Select Decide', text: 'Get one answer, along with the chance each option had.' },
];

export const formulas = [
  { title: 'Chance of an option', text: 'Its weight ÷ the total of all weights × 100. An option with no weight counts as 1.' },
  { title: 'Equal options', text: 'With no weights, each of 4 options has a 25% chance.' },
  { title: 'Weighted options', text: 'Pizza | 3 and Salad | 1 gives pizza a 75% chance and salad a 25% chance.' },
];

export const examples = [
  { title: 'What to eat', text: 'Pizza, Noodles, Dosa, each on its own line, gives each a 33.33% chance.' },
  { title: 'A leaning', text: 'Stay in | 1 and Go out | 2 gives going out twice the chance.' },
  { title: 'Yes or no', text: 'Yes and No on separate lines works as a quick fair answer.' },
];

export const faqs = [
  {
    question: 'Should I really follow the answer?',
    answer: 'For small choices, why not. For anything important, use it as a nudge. How you feel about the answer often tells you what you really want.',
  },
  {
    question: 'How is this different from the Random Name Picker?',
    answer: 'This gives one answer and lets you favour options with weights. The Name Picker draws one or more winners from a list, with equal chances.',
  },
  {
    question: 'What if my option contains a | symbol?',
    answer: 'The part after the last | is read as a weight, and a line with a word there shows an error. Use a different symbol in your option.',
  },
  {
    question: 'Is anything saved?',
    answer: 'No. Your options stay in your browser, and are gone when you leave the page.',
  },
];
