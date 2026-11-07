export const howItWorks = [
  { title: 'Add or remove tax', text: 'Add tax to a price, or work out the tax already inside a price.' },
  { title: 'Enter the price and rate', text: 'Use any rate, such as a sales tax, VAT or a cess.' },
  { title: 'See the split', text: 'Get the tax, the price before tax and the price including tax.' },
];

export const formulas = [
  { title: 'Adding tax', text: 'Tax = price × rate ÷ 100, and total = price + tax' },
  { title: 'Removing tax', text: 'Price before tax = price including tax ÷ (1 + rate ÷ 100)' },
  { title: 'Rounding', text: 'Amounts are rounded to the nearest paisa.' },
];

export const examples = [
  { title: 'Adding 8% tax', text: '₹250 plus 8% tax is ₹20 tax, so ₹270 in total.' },
  { title: 'Removing 12% tax', text: '₹1,120 including 12% tax is ₹1,000 before tax plus ₹120 tax.' },
  { title: 'Travelling abroad', text: 'A $40 price with 7.25% sales tax comes to $42.90. The maths is the same in any currency.' },
];

export const faqs = [
  {
    question: 'Why not just take the rate off the total?',
    answer: 'Because the tax was worked out on the lower price. Taking 12% off ₹1,120 gives ₹985.60, but the real price before tax is ₹1,000.',
  },
  {
    question: 'Should I use this or the GST Calculator?',
    answer: 'For Indian GST, use the GST Calculator, which also splits the tax into CGST and SGST or IGST. Use this tool for any other single tax rate.',
  },
  {
    question: 'Can I use it for other currencies?',
    answer: 'Yes. The amounts are shown in rupees, but the calculation is the same for any currency.',
  },
  {
    question: 'What if there are two taxes?',
    answer: 'If both apply to the same price, add the rates together. If the second tax applies on top of the first, run the calculator twice.',
  },
];
