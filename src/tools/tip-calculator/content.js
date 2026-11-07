export const howItWorks = [
  { title: 'Enter the bill', text: 'Type the amount on the bill, before or after tax, whichever you want to tip on.' },
  { title: 'Pick a tip', text: 'Choose 5, 10, 15 or 20%, or type any percentage.' },
  { title: 'Split it', text: 'Enter how many people are paying, and round each share up to a whole rupee if you like.' },
];

export const formulas = [
  { title: 'Tip', text: 'Tip = bill × tip % ÷ 100' },
  { title: 'Total', text: 'Total = bill + tip' },
  { title: 'Each share', text: 'Each person pays total ÷ number of people, rounded up to the paisa or the rupee.' },
];

export const examples = [
  { title: 'Dinner for one', text: 'A 10% tip on ₹1,000 is ₹100, so you pay ₹1,100.' },
  { title: 'Split four ways', text: 'A 15% tip on ₹2,400 is ₹360. The ₹2,760 total is ₹690 each.' },
  { title: 'Rounded shares', text: '₹1,234.50 with 15% between 4 people is ₹354.92 each, or ₹355 each when rounded up.' },
];

export const faqs = [
  {
    question: 'How much should I tip in India?',
    answer: 'Tipping is optional. Around 5 to 10% is common at restaurants, and many people round up for delivery or cab rides. Check the bill first, as some places add a service charge.',
  },
  {
    question: 'Should I tip on the amount before or after GST?',
    answer: 'Either is fine. Tipping on the amount before tax is common, so enter that amount if you prefer.',
  },
  {
    question: 'Why is the tip slightly more than I chose?',
    answer: 'When the total cannot be split evenly, each share is rounded up so nobody is short. The few paise extra go to the tip, and the calculator tells you how much.',
  },
  {
    question: 'How is this different from the Bill Split Calculator?',
    answer: 'This tool focuses on the tip. The Bill Split Calculator also handles tax and gives an exact split where shares can differ by a paisa.',
  },
];
