export const howItWorks = [
  { title: 'Enter your amount', text: 'Type the starting amount, the yearly interest rate and how many years it grows for.' },
  { title: 'Choose the compounding', text: 'Most Indian bank fixed deposits compound quarterly. Pick what your bank or scheme uses.' },
  { title: 'Add monthly deposits', text: 'Optionally add an amount you pay in at the end of every month, like a recurring deposit.' },
];

export const formulas = [
  { title: 'Compound interest', text: 'A = P × (1 + r ÷ n)^(n × t), where n is how many times a year interest is added.' },
  { title: 'Effective yearly rate', text: 'Effective rate = (1 + r ÷ n)^n − 1. Quarterly 8% is 8.24% a year.' },
  { title: 'Monthly deposits', text: 'Each deposit grows at the same rate from the month it is paid in.' },
];

export const examples = [
  { title: 'Fixed deposit', text: '₹1,00,000 at 8% compounded quarterly for 5 years grows to ₹1,48,594.74.' },
  { title: 'Monthly saving', text: '₹5,000 a month at 12% compounded monthly for 10 years grows to ₹11,50,193.45 from ₹6,00,000 paid in.' },
  { title: 'Yearly compounding', text: '₹1,00,000 at 10% compounded yearly is ₹1,10,000 after one year.' },
];

export const faqs = [
  {
    question: 'How is compound interest different from simple interest?',
    answer: 'Simple interest is only paid on the starting amount. Compound interest is also paid on interest already earned, so the balance grows faster each year.',
  },
  {
    question: 'Does more frequent compounding make a big difference?',
    answer: 'A little. At 8%, yearly compounding gives 8% a year, quarterly gives 8.24% and daily gives about 8.33%.',
  },
  {
    question: 'When are the monthly deposits added?',
    answer: 'At the end of each month, after that month’s interest. A deposit at the start of the month would earn slightly more.',
  },
  {
    question: 'Is tax included?',
    answer: 'No. Interest from fixed deposits is taxable in India, so your amount after tax will be lower.',
  },
];
