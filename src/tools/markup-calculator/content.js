export const howItWorks = [
  { title: 'Choose a calculation', text: 'Set a price from a markup or a margin, or work out the markup and margin from two prices.' },
  { title: 'Enter your values', text: 'The cost is what you paid. Percentages can have decimals.' },
  { title: 'Compare markup and margin', text: 'Both are shown side by side, so you can quote whichever one you need.' },
];

export const formulas = [
  { title: 'Markup', text: 'Markup % = (selling price − cost) ÷ cost × 100' },
  { title: 'Margin', text: 'Margin % = (selling price − cost) ÷ selling price × 100' },
  { title: 'Price from markup', text: 'Selling price = cost × (1 + markup ÷ 100)' },
  { title: 'Price from margin', text: 'Selling price = cost ÷ (1 − margin ÷ 100)' },
];

export const examples = [
  { title: '50% markup', text: 'An item that costs ₹400 with a 50% markup sells for ₹600, which is a 33.33% margin.' },
  { title: '40% margin', text: 'For a 40% margin on a ₹600 cost, sell at ₹1,000. That is a 66.67% markup.' },
  { title: 'Finding both', text: 'Bought at ₹250 and sold at ₹400: a 60% markup and a 37.5% margin.' },
];

export const faqs = [
  {
    question: 'What is the difference between markup and margin?',
    answer: 'Both use the same profit. Markup divides it by the cost, and margin divides it by the selling price. So markup is always the larger number.',
  },
  {
    question: 'Why can the margin not be 100% or more?',
    answer: 'A margin is a share of the selling price, so it can never reach 100% unless the item cost nothing.',
  },
  {
    question: 'How do I turn a markup into a margin?',
    answer: 'Margin = markup ÷ (100 + markup) × 100. A 25% markup is a 20% margin.',
  },
  {
    question: 'Does the price include GST?',
    answer: 'No. Add GST to the selling price afterwards with the GST Calculator.',
  },
];
