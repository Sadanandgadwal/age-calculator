export const howItWorks = [
  { title: 'Choose what to work out', text: 'Simplify a ratio, find a missing value in A : B = C : ?, or split a total in a ratio.' },
  { title: 'Enter the numbers', text: 'Whole numbers and decimals are both fine, such as 1.5 : 2.25.' },
  { title: 'Calculate', text: 'See the answer along with the ratio as 1 : n, n : 1 and as percentage shares.' },
];

export const formulas = [
  { title: 'Simplifying', text: 'Divide both numbers by their greatest common divisor. 12 : 16 ÷ 4 = 3 : 4.' },
  { title: 'Missing value', text: 'If A : B = C : ?, then ? = B × C ÷ A.' },
  { title: 'Sharing a total', text: 'Part A = total × A ÷ (A + B), and Part B = total × B ÷ (A + B).' },
];

export const examples = [
  { title: 'Simplify', text: '12 : 16 simplifies to 3 : 4, which is 1 : 1.33 or 42.86% : 57.14%.' },
  { title: 'Scale a recipe', text: 'If 2 cups of flour need 3 eggs, then 10 cups need 2 : 3 = 10 : ?, so 15 eggs.' },
  { title: 'Share money', text: '₹1,000 shared in the ratio 2 : 3 gives ₹400 and ₹600.' },
];

export const faqs = [
  {
    question: 'How are decimal ratios simplified?',
    answer: 'Both numbers are multiplied by the same power of 10 to make them whole, then divided by their greatest common divisor. So 1.5 : 2.25 becomes 150 : 225 and then 2 : 3.',
  },
  {
    question: 'What does 1 : n mean?',
    answer: 'It scales the ratio so the first number is 1. A ratio of 4 : 10 is 1 : 2.5, so there are 2.5 of the second for every 1 of the first.',
  },
  {
    question: 'Can I use zero or negative numbers?',
    answer: 'No. Every part of a ratio here must be greater than zero, as a ratio with zero has no meaningful simplest form or share.',
  },
  {
    question: 'How are answers rounded?',
    answer: 'Answers show up to two decimal places, and the two parts of a shared total always add up to the total.',
  },
];
