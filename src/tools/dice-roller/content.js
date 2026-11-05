export const howItWorks = [
  { title: 'Choose a die', text: 'Pick the number of sides, from a d4 up to a d100.' },
  { title: 'Choose how many', text: 'Roll 1 die or up to 100 at once.' },
  { title: 'Select Roll', text: 'See the total, every roll, and the highest and lowest. Select Roll again to go again.' },
];

export const formulas = [
  { title: 'Dice notation', text: '2d6 means two six-sided dice. The first number is how many, and the second is the number of sides.' },
  { title: 'Fair odds', text: 'Each side of a die has the same chance. On a d20, each number comes up 1 time in 20 on average.' },
  { title: 'Average total', text: 'Number of dice × (sides + 1) ÷ 2. So 3d6 averages 10.5.' },
];

export const examples = [
  { title: 'Board games', text: 'Use 2d6 for most classic board games, giving totals from 2 to 12.' },
  { title: 'Role-playing', text: 'Use 1d20 for an attack roll, or 8d6 for a big spell.' },
  { title: 'Percentile rolls', text: 'Use 1d100 when a game gives a percentage chance.' },
];

export const faqs = [
  {
    question: 'Are the rolls fair?',
    answer: 'Yes. They use your browser’s secure random generator with no rounding bias, so each side is equally likely. That can be fairer than worn physical dice.',
  },
  {
    question: 'Why do some totals come up more with 2d6?',
    answer: 'There are more ways to make them. A total of 7 has six combinations, while a 2 has only one.',
  },
  {
    question: 'Can I add a modifier, such as +3?',
    answer: 'Not yet. Add it to the total shown yourself.',
  },
];
