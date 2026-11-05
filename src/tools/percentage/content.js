export const howItWorks = [
  { title: 'Choose a calculation', text: 'Pick the question you want to answer, such as finding a percentage of a number or the change between two values.' },
  { title: 'Enter your numbers', text: 'Fill in the two values. Decimals and negative numbers are accepted where they make sense.' },
  { title: 'See the working', text: 'You get the answer along with the formula and each step, so you can check it or learn from it.' },
];

export const formulas = [
  { title: 'Percentage of a number', text: 'Result = (Percentage ÷ 100) × Number' },
  { title: 'X as a percentage of Y', text: 'Percentage = (X ÷ Y) × 100' },
  { title: 'Percentage change', text: 'Change = ((Final − Start) ÷ |Start|) × 100' },
];

export const examples = [
  { title: 'What is 20% of 500?', text: '(20 ÷ 100) × 500 = 100.' },
  { title: '50 is what percentage of 200?', text: '(50 ÷ 200) × 100 = 25%.' },
  { title: 'Increase 500 by 20%', text: '20% of 500 is 100, and 500 + 100 = 600. Decreasing 500 by 20% gives 400.' },
];

export const faqs = [
  {
    question: 'What is the difference between percentage change and percentage difference?',
    answer:
      'Percentage change measures a move from a starting value to a final value, so direction matters. Percentage difference compares two values with neither as the starting point, using their average.',
  },
  {
    question: 'Why is a 50% increase followed by a 50% decrease not the original number?',
    answer:
      'Each percentage applies to a different starting value. 100 increased by 50% is 150, and 150 decreased by 50% is 75.',
  },
  {
    question: 'Why can some values not be zero?',
    answer:
      'Some formulas divide by that value, and dividing by zero has no answer. For example, a percentage change from 0 is undefined.',
  },
  {
    question: 'How are results rounded?',
    answer: 'Results show up to four decimal places. Very small numbers show four significant digits instead.',
  },
];
