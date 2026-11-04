export const howItWorks = [
  { title: 'Enter the bill', text: 'Add the bill amount and the number of people sharing it.' },
  { title: 'Add tax and tip', text: 'Tax and tip are optional, and both are worked out on the bill amount.' },
  { title: 'See each share', text: 'Get what each person pays, exact to the paisa, or round up to whole rupees for easy payment.' },
];

export const formulas = [
  { title: 'Total', text: 'Total = bill + (bill × tax ÷ 100) + (bill × tip ÷ 100)' },
  { title: 'Each share', text: 'Each share = total ÷ number of people' },
  { title: 'Rounding up', text: 'Each share is rounded up to the next whole rupee, and any amount left over is shown.' },
];

export const examples = [
  { title: 'Even split', text: 'A ₹1,200 bill split between 4 people is ₹300 each.' },
  { title: 'With tax and tip', text: '₹1,000 with 5% tax and 10% tip is ₹1,150. Between 5 people, that is ₹230 each.' },
  { title: 'Uneven paise', text: '₹100 between 3 people: 1 person pays ₹33.34 and 2 people pay ₹33.33.' },
];

export const faqs = [
  {
    question: 'What if the bill does not divide evenly?',
    answer: 'A few people pay one extra paisa, so the shares add up to exactly the total. The result shows how many people pay each amount.',
  },
  {
    question: 'Is the tip worked out before or after tax?',
    answer: 'The tip is worked out on the bill amount before tax. If your bill already includes tax, leave the tax field blank.',
  },
  {
    question: 'What does rounding up do?',
    answer: 'It rounds each share up to the next whole rupee, which makes payment simpler. The result shows any amount left over after paying the bill.',
  },
  {
    question: 'Can I split a bill unequally?',
    answer: 'This calculator splits the total equally. For an unequal split, calculate each group separately using the part of the bill they share.',
  },
];
