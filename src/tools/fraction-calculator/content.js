export const howItWorks = [
  { title: 'Choose what to do', text: 'Work out two fractions, simplify one fraction, or turn a decimal into a fraction.' },
  { title: 'Type your fractions', text: 'Use 3/4 for a fraction, 1 1/2 for a mixed number, and 5 for a whole number.' },
  { title: 'See every form', text: 'Get the simplified fraction, the mixed number, the decimal and the working.' },
];

export const formulas = [
  { title: 'Adding and subtracting', text: 'a/b + c/d: write both over the lowest common denominator, add the tops, then simplify.' },
  { title: 'Multiplying', text: 'a/b × c/d = (a × c) / (b × d)' },
  { title: 'Dividing', text: 'a/b ÷ c/d = a/b × d/c. Flip the second fraction and multiply.' },
  { title: 'Simplifying', text: 'Divide the top and bottom by their greatest common divisor.' },
];

export const examples = [
  { title: 'Adding', text: '1/2 + 1/3 = 3/6 + 2/6 = 5/6' },
  { title: 'Dividing', text: '3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2, or 1 1/2 as a mixed number.' },
  { title: 'Decimal to fraction', text: '0.375 = 375/1000 = 3/8' },
];

export const faqs = [
  {
    question: 'How do I enter a mixed number?',
    answer: 'Type the whole number, a space, then the fraction, such as 2 3/4. A minus sign at the start makes the whole mixed number negative, so -2 3/4 is −2.75.',
  },
  {
    question: 'Are the answers exact?',
    answer: 'Yes. Fractions are worked out with whole numbers, so there is no rounding. Only the decimal form is rounded, to six decimal places, and marked with ≈ when it is.',
  },
  {
    question: 'Can I turn a repeating decimal such as 0.333… into 1/3?',
    answer: 'Not directly. The tool converts exactly what you type, so 0.333 becomes 333/1000. Type the fraction 1/3 instead.',
  },
  {
    question: 'How large can the numbers be?',
    answer: 'Each number can have up to 12 digits.',
  },
];
