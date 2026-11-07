export const howItWorks = [
  { title: 'Set your goal', text: 'Enter how much you need, what you have saved already and the yearly return you expect.' },
  { title: 'Pick a question', text: 'Find how much to save each month to reach the goal in time, or how long a monthly amount takes.' },
  { title: 'Follow the plan', text: 'See the balance, what you put in and the interest earned, year by year.' },
];

export const formulas = [
  { title: 'Monthly saving', text: 'PMT = (goal − current × (1 + r)ⁿ) × r ÷ ((1 + r)ⁿ − 1), where r = yearly return ÷ 12 and n is the number of months.' },
  { title: 'Growth', text: 'Each month the balance earns r, then the monthly saving is added.' },
  { title: 'No return', text: 'At 0%, the monthly saving is simply (goal − current) ÷ months.' },
];

export const examples = [
  { title: 'A ₹10 lakh goal', text: 'To reach ₹10,00,000 in 5 years at 8%, save about ₹13,609.73 a month.' },
  { title: 'Saving without returns', text: 'With ₹1,00,000 saved and 3 years to reach ₹10,00,000 at 0%, save ₹25,000 a month.' },
  { title: 'How long', text: 'With ₹50,000 saved, ₹10,000 a month at 7% reaches ₹5,00,000 in 3 years 4 months.' },
];

export const faqs = [
  {
    question: 'What return should I expect?',
    answer: 'It depends on where you save. Savings accounts and fixed deposits pay less than equity funds, which carry more risk. Using a lower rate gives a safer plan.',
  },
  {
    question: 'When are the savings added?',
    answer: 'At the end of each month, after that month’s return is added.',
  },
  {
    question: 'Does it allow for inflation?',
    answer: 'No. If your goal is for something in the future, use the Inflation Calculator to work out its future cost first, then use that as the goal.',
  },
  {
    question: 'Why is the final balance slightly above my goal?',
    answer: 'The monthly saving is rounded up to the next paisa, so you always reach the goal, sometimes with a few paise to spare.',
  },
];
