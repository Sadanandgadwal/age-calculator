export const howItWorks = [
  { title: 'Enter your loan', text: 'Add the loan amount, the yearly interest rate and the tenure in years or months.' },
  { title: 'See your EMI', text: 'Get your monthly payment, along with the total interest and total amount you will pay.' },
  { title: 'Check the schedule', text: 'The yearly schedule shows how much of each year goes to principal and interest.' },
];

export const formulas = [
  { title: 'EMI', text: 'EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)' },
  { title: 'What the letters mean', text: 'P is the loan amount, r is the monthly interest rate (yearly rate ÷ 12 ÷ 100) and n is the number of months.' },
  { title: 'Total interest', text: 'Total interest = total of all payments − loan amount' },
];

export const examples = [
  { title: 'Home loan', text: '₹10,00,000 at 8.5% for 20 years has an EMI of about ₹8,678.' },
  { title: 'Personal loan', text: '₹5,00,000 at 10% for 5 years has an EMI of about ₹10,624.' },
  { title: 'Interest-free', text: '₹60,000 at 0% for 12 months has an EMI of ₹5,000.' },
];

export const faqs = [
  {
    question: 'What does EMI mean?',
    answer: 'EMI stands for equated monthly instalment, the fixed amount you pay each month until a loan is repaid. Each payment covers interest and part of the loan.',
  },
  {
    question: 'Why does the first year have so much interest?',
    answer: 'Interest is charged on the balance you still owe. The balance is highest at the start, so early payments go mostly to interest.',
  },
  {
    question: 'Why might my lender show a different EMI?',
    answer: 'Lenders can differ in rounding, payment dates and fees. This calculator assumes a fixed rate and equal monthly payments, and does not include processing fees or insurance.',
  },
  {
    question: 'Is this a loan offer or financial advice?',
    answer: 'No. It provides estimates only, so confirm the exact terms with your lender before deciding.',
  },
];
