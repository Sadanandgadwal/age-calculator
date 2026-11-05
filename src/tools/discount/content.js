export const howItWorks = [
  { title: 'Choose a calculation', text: 'Find the price after a discount, the discount percentage from two prices, or the original price.' },
  { title: 'Enter your prices', text: 'Fill in the two values. Decimal prices and percentages are accepted.' },
  { title: 'See what you save', text: 'Get the final price, the amount you save and the discount percentage.' },
];

export const formulas = [
  { title: 'Price after discount', text: 'Final price = original price − (original price × discount ÷ 100)' },
  { title: 'Discount percentage', text: 'Discount % = (original price − sale price) ÷ original price × 100' },
  { title: 'Original price', text: 'Original price = sale price ÷ (1 − discount ÷ 100)' },
];

export const examples = [
  { title: '20% off', text: '₹1,000 with 20% off saves ₹200, so the final price is ₹800.' },
  { title: 'Finding the discount', text: 'A price cut from ₹1,000 to ₹750 is a 25% discount.' },
  { title: 'Finding the original price', text: 'If ₹800 is the price after 20% off, the original price was ₹1,000.' },
];

export const faqs = [
  {
    question: 'Are two discounts the same as adding the percentages?',
    answer: 'No. A second discount applies to the already reduced price, so 20% off and then 10% off is 28% off in total, not 30%. Enter the final price to find the overall discount.',
  },
  {
    question: 'Does the result include GST or other taxes?',
    answer: 'No. The calculator only applies the discount to the prices you enter, so add any tax separately if it is not already included.',
  },
  {
    question: 'Why can the discount not be 100% when finding the original price?',
    answer: 'At 100% off the sale price is always zero, so there is no way to work out the original price from it.',
  },
  {
    question: 'How are prices rounded?',
    answer: 'Amounts are rounded to the nearest paisa. Discount percentages show up to two decimal places.',
  },
];
