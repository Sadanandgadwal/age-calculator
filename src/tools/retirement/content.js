export const howItWorks = [
  { title: 'Enter your ages', text: 'Your age now, when you plan to retire, and the age to plan your money up to.' },
  { title: 'Enter your expenses', text: 'Use what you spend each month today. The calculator raises it for inflation until you retire and every year after.' },
  { title: 'Check the returns', text: 'Change the expected returns and inflation to match your investments, then see how much to save each month.' },
];

export const formulas = [
  { title: 'Expenses at retirement', text: 'Future expenses = today’s expenses × (1 + inflation)^years until retirement' },
  { title: 'Money needed', text: 'The amount that, earning the after-retirement return, pays your rising monthly expenses until the planned age.' },
  { title: 'Monthly saving', text: 'Saving = still needed × r ÷ ((1 + r)ⁿ − 1), where r is the monthly return before retirement.' },
];

export const examples = [
  { title: 'Planning at 30', text: '₹50,000 a month today, retiring at 60 with 6% inflation, is about ₹2,87,175 a month at retirement.' },
  { title: 'With savings', text: 'With ₹5 lakh saved, 12% returns before and 7% after retirement, the plan needs about ₹7.49 crore, or ₹16,284 a month.' },
  { title: 'No growth', text: 'At 0% inflation and returns, ₹30,000 a month for 20 years needs ₹72 lakh, or ₹30,000 a month for 20 years.' },
];

export const faqs = [
  {
    question: 'What inflation rate should I use?',
    answer: 'Indian consumer inflation has often been between 4 and 7% a year. Many planners use 6% to stay on the safe side.',
  },
  {
    question: 'Why is the return after retirement lower?',
    answer: 'People usually move to safer investments after retiring, which tend to earn less. Using a lower rate keeps the plan realistic.',
  },
  {
    question: 'Does this include EPF, PPF or NPS?',
    answer: 'Only if you add their current balances to your savings so far. Regular contributions you already make count towards the monthly saving shown.',
  },
  {
    question: 'Is tax included?',
    answer: 'No. Withdrawals and returns may be taxed, so consider keeping a margin above the amount shown.',
  },
];
