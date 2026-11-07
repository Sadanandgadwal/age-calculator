export const howItWorks = [
  { title: 'Enter your loan', text: 'Type the amount you still owe, the interest rate and the years left on the loan.' },
  { title: 'Add an extra payment', text: 'Enter how much more than your EMI you can pay each month.' },
  { title: 'See what you save', text: 'Compare the interest and time with and without the extra payment, year by year.' },
];

export const formulas = [
  { title: 'Current EMI', text: 'EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where r is the monthly rate and n the months left.' },
  { title: 'Each month', text: 'Interest = balance × yearly rate ÷ 12. The rest of the payment reduces the balance.' },
  { title: 'Savings', text: 'Interest saved = interest without extra payments − interest with them.' },
];

export const examples = [
  { title: 'Home loan', text: '₹10 lakh at 8.5% over 20 years has an EMI of ₹8,678.23. Paying ₹5,000 more each month clears it in 8 years 8 months and saves ₹6,69,067.37 in interest.' },
  { title: 'Car loan', text: '₹5 lakh at 10% over 7.5 years, with ₹2,000 extra each month, finishes 2 years early and saves ₹61,478.31.' },
  { title: 'No extra payment', text: 'Enter 0 to see the full schedule of your current loan.' },
];

export const faqs = [
  {
    question: 'Does paying extra always save money?',
    answer: 'It reduces the interest you pay, because each extra rupee lowers the balance that interest is charged on. Check for prepayment charges first, as some fixed-rate loans have them.',
  },
  {
    question: 'Is it better to reduce the EMI or the tenure?',
    answer: 'Keeping the same EMI and shortening the tenure, as this calculator shows, usually saves more interest than lowering the EMI.',
  },
  {
    question: 'Are floating-rate loans handled?',
    answer: 'The calculator assumes the rate stays the same. If your rate changes, run it again with the new rate and the balance at that time.',
  },
  {
    question: 'Why might my bank’s figures differ slightly?',
    answer: 'Banks may round each instalment differently or charge interest daily. The results here are close estimates.',
  },
];
