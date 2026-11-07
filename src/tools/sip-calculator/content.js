export const howItWorks = [
  { title: 'Enter your SIP', text: 'Type the amount you invest every month and the yearly return you expect.' },
  { title: 'Choose the time', text: 'Enter how many years you plan to keep investing.' },
  { title: 'Add a step-up', text: 'Optionally raise your SIP by a percentage every year, for example when your salary rises.' },
];

export const formulas = [
  { title: 'SIP value', text: 'Value = P × ((1 + r)ⁿ − 1) ÷ r × (1 + r), where r is the monthly return and n the number of months.' },
  { title: 'Monthly return', text: 'r = yearly return ÷ 12. Each instalment is invested at the start of the month.' },
  { title: 'Step-up', text: 'After every 12 months, the monthly amount rises by the step-up percentage.' },
];

export const examples = [
  { title: '₹5,000 for 10 years', text: 'At 12% a year, ₹6,00,000 invested could grow to about ₹11,61,695.' },
  { title: 'With a 10% step-up', text: 'Raising the same SIP by 10% each year invests ₹9,56,245.80 and could grow to about ₹16,87,164.' },
  { title: 'No return', text: 'At 0%, ₹1,000 a month for a year is simply ₹12,000.' },
];

export const faqs = [
  {
    question: 'What return should I expect from a SIP?',
    answer: 'It depends on the fund. Equity funds have returned more over long periods but can fall in the short term. Debt funds are steadier but earn less. Past returns do not guarantee future ones.',
  },
  {
    question: 'Why does my fund app show a different value?',
    answer: 'Real funds earn a different return every month, have charges, and buy units at changing prices. This calculator assumes a steady return, so it is an estimate.',
  },
  {
    question: 'Is tax included?',
    answer: 'No. Gains from mutual funds may be taxed when you redeem, depending on the fund type and how long you held it.',
  },
  {
    question: 'What is a step-up SIP?',
    answer: 'A SIP that grows each year by a fixed percentage. Even a small step-up can add a lot to the final value over a long time.',
  },
];
