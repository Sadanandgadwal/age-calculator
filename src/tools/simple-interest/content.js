export const howItWorks = [
  { title: 'Choose what to find', text: 'Work out the interest, or find the principal, rate or time from the other three.' },
  { title: 'Enter your values', text: 'The rate is per year and the time is in years. Use decimals for part years, such as 1.5.' },
  { title: 'See the total', text: 'Get the answer along with the total amount at the end.' },
];

export const formulas = [
  { title: 'Simple interest', text: 'SI = P × R × T ÷ 100' },
  { title: 'Total amount', text: 'Amount = P + SI' },
  { title: 'Rearranged', text: 'P = SI × 100 ÷ (R × T), R = SI × 100 ÷ (P × T), T = SI × 100 ÷ (P × R)' },
];

export const examples = [
  { title: 'Interest', text: '₹50,000 at 8% for 3 years earns ₹12,000, so the total is ₹62,000.' },
  { title: 'Rate', text: 'If ₹50,000 earns ₹12,000 in 3 years, the rate is 8% a year.' },
  { title: 'Time', text: '₹50,000 at 8% takes 1.25 years, or 15 months, to earn ₹5,000.' },
];

export const faqs = [
  {
    question: 'Where is simple interest used?',
    answer: 'Some personal loans between people, short-term loans, gold loans and textbook problems use simple interest. Bank deposits and most loans use compound interest.',
  },
  {
    question: 'How do I enter months instead of years?',
    answer: 'Divide the months by 12. For example, 18 months is 1.5 years and 9 months is 0.75 years.',
  },
  {
    question: 'How is it different from compound interest?',
    answer: 'Simple interest is only charged on the original principal, so it grows by the same amount each year. Compound interest also earns interest on past interest.',
  },
  {
    question: 'How are results rounded?',
    answer: 'Amounts are rounded to the nearest paisa, and rates and times to two decimal places.',
  },
];
