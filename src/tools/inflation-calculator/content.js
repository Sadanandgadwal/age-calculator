export const howItWorks = [
  { title: 'Choose a direction', text: 'Work out what something will cost in the future, or what an old amount is worth in today’s money.' },
  { title: 'Enter the inflation rate', text: 'Use an average yearly rate. The default of 6% is a common planning figure in India.' },
  { title: 'See the effect', text: 'Get the new amount, how much prices rise in total, and how much buying power is lost.' },
];

export const formulas = [
  { title: 'Future cost', text: 'Future cost = cost today × (1 + inflation)^years' },
  { title: 'Past money today', text: 'Value today = past amount × (1 + inflation)^years ago' },
  { title: 'Buying power', text: 'Buying power = amount ÷ (1 + inflation)^years' },
];

export const examples = [
  { title: 'Ten years ahead', text: 'Something costing ₹1,00,000 today will cost about ₹1,79,085 in 10 years at 6% inflation.' },
  { title: 'Twenty years back', text: '₹1,000 from 20 years ago is worth about ₹3,870 today at 7% inflation.' },
  { title: 'Buying power', text: 'At 6% inflation, ₹1,00,000 in 10 years will buy what about ₹55,839 buys today.' },
];

export const faqs = [
  {
    question: 'What inflation rate should I use?',
    answer: 'India’s consumer price inflation has mostly been between 4 and 7% a year in recent years. Education and healthcare costs often rise faster, so use a higher rate for those goals.',
  },
  {
    question: 'Does it use official price data?',
    answer: 'No. It uses the rate you enter, the same for every year. For an exact past figure, use the official consumer price index for the years you need.',
  },
  {
    question: 'Why does inflation matter for savings?',
    answer: 'If your savings earn less than inflation, they buy less each year, even though the number in your account grows.',
  },
  {
    question: 'Can I use part years?',
    answer: 'Yes. Enter 2.5 for two and a half years.',
  },
];
