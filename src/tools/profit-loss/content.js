export const howItWorks = [
  { title: 'Choose a calculation', text: 'Find the profit or loss from two prices, the selling price for a target profit, or the cost price.' },
  { title: 'Enter your values', text: 'Prices are in rupees. For a loss percentage, put a minus sign in front, such as -10.' },
  { title: 'See the result', text: 'Get the profit or loss amount, the percentage on cost and the margin on the selling price.' },
];

export const formulas = [
  { title: 'Profit or loss', text: 'Profit = selling price − cost price. A negative result is a loss.' },
  { title: 'Profit %', text: 'Profit % = profit ÷ cost price × 100' },
  { title: 'Margin', text: 'Margin = profit ÷ selling price × 100' },
  { title: 'Selling price', text: 'Selling price = cost price × (1 + profit % ÷ 100)' },
];

export const examples = [
  { title: 'A profit', text: 'Bought for ₹800 and sold for ₹1,000: a ₹200 profit, which is 25% on cost and a 20% margin.' },
  { title: 'A loss', text: 'Bought for ₹1,000 and sold for ₹800: a ₹200 loss, which is 20% of the cost.' },
  { title: 'Pricing for profit', text: 'To make 25% on an item that cost ₹800, sell it for ₹1,000.' },
];

export const faqs = [
  {
    question: 'What is the difference between profit % and margin?',
    answer: 'Profit % compares the profit with the cost price, while margin compares it with the selling price. The same ₹200 profit on ₹800 is 25% profit but a 20% margin.',
  },
  {
    question: 'How do I enter a loss?',
    answer: 'In the modes that ask for a percentage, put a minus sign in front of it. For example, -10 means a 10% loss.',
  },
  {
    question: 'Does this include GST or other costs?',
    answer: 'No. Include every cost you want counted, such as shipping, in the cost price. Use the GST Calculator for tax.',
  },
  {
    question: 'How are amounts rounded?',
    answer: 'Amounts are rounded to the nearest paisa and percentages to two decimal places.',
  },
];
