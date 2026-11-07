export const howItWorks = [
  { title: 'Enter what you put in', text: 'The amount you invested at the start, in one go.' },
  { title: 'Enter what it is worth', text: 'The value today, or when you sold it, and how many years you held it.' },
  { title: 'Compare returns', text: 'The yearly return (CAGR) lets you compare investments held for different lengths of time.' },
];

export const formulas = [
  { title: 'Total return', text: 'Total return = (current value − amount invested) ÷ amount invested × 100' },
  { title: 'CAGR', text: 'CAGR = (current value ÷ amount invested)^(1 ÷ years) − 1' },
  { title: 'Doubling time', text: 'Years to double = log 2 ÷ log(1 + CAGR)' },
];

export const examples = [
  { title: 'Doubling in 5 years', text: '₹1,00,000 growing to ₹2,00,000 in 5 years is a 100% total return, or 14.87% a year.' },
  { title: 'A loss', text: '₹50,000 falling to ₹40,000 over 2 years is a 20% loss, or −10.56% a year.' },
  { title: 'Comparing', text: '50% over 3 years (14.47% a year) beats 70% over 5 years (11.2% a year).' },
];

export const faqs = [
  {
    question: 'What is CAGR?',
    answer: 'The compound annual growth rate is the steady yearly return that would turn your starting amount into the final amount over the same time. It smooths out the ups and downs.',
  },
  {
    question: 'Can I use it for SIPs or several deposits?',
    answer: 'No. CAGR assumes a single amount invested at the start. For regular investments, a measure called XIRR is needed.',
  },
  {
    question: 'Are dividends included?',
    answer: 'Only if you include them in the current value. Add any dividends or interest paid out to get the full return.',
  },
  {
    question: 'Why is the yearly return so high for a short time?',
    answer: 'For less than a year, the return is scaled up as if the same growth continued all year. Short-term gains rarely last, so treat that figure with care.',
  },
];
