export const howItWorks = [
  { title: 'Enter your pay', text: 'Type the amount and choose whether it is per hour, day, week, month or year.' },
  { title: 'Set your hours', text: 'Enter the hours and days you work in a normal week.' },
  { title: 'Compare', text: 'See your pay for every period, and optionally what it becomes after a raise or cut.' },
];

export const formulas = [
  { title: 'Yearly pay', text: 'Yearly = hourly × hours a week × 52, or daily × days a week × 52, or weekly × 52, or monthly × 12.' },
  { title: 'Other periods', text: 'Monthly = yearly ÷ 12, weekly = yearly ÷ 52, daily = weekly ÷ days a week, hourly = weekly ÷ hours a week.' },
  { title: 'Raise', text: 'New pay = pay × (1 + raise ÷ 100). Use a minus sign for a cut.' },
];

export const examples = [
  { title: 'Monthly salary', text: '₹50,000 a month is ₹6,00,000 a year, or about ₹288.46 an hour at 40 hours a week.' },
  { title: 'Hourly rate', text: '₹500 an hour for 40 hours a week is ₹10,40,000 a year, or ₹86,666.67 a month.' },
  { title: 'A 10% raise', text: 'A 10% raise on ₹500 an hour takes yearly pay to ₹11,44,000.' },
];

export const faqs = [
  {
    question: 'Is this my take-home pay?',
    answer: 'No. The amounts are before income tax, provident fund and other deductions. Your take-home pay will be lower.',
  },
  {
    question: 'Why 52 weeks?',
    answer: 'A year has 52 weeks and a day or two. Paid holidays are counted as working weeks, which is how most salaries are quoted.',
  },
  {
    question: 'I work six days a week. Does that change anything?',
    answer: 'Yes, for daily and hourly pay. Enter your real days and hours, and the daily and hourly figures adjust.',
  },
  {
    question: 'Can I convert CTC to in-hand salary?',
    answer: 'Not with this tool. In-hand salary depends on your salary structure and the tax rules for the year, which change with each Budget.',
  },
];
