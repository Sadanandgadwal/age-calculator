export const howItWorks = [
  { title: 'Type a number or numeral', text: 'Enter a whole number from 1 to 3,999, or a Roman numeral in capital or small letters.' },
  { title: 'See the answer', text: 'The conversion runs as you type, in whichever direction fits what you entered.' },
  { title: 'Check the parts', text: 'Each symbol and its value is listed, along with the sum.' },
];

export const formulas = [
  { title: 'Symbols', text: 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1,000' },
  { title: 'Subtraction', text: 'A smaller symbol before a larger one is taken away: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.' },
  { title: 'Repeats', text: 'I, X, C and M can repeat up to three times in a row. V, L and D never repeat.' },
];

export const examples = [
  { title: '2026', text: 'MMXXVI = 1,000 + 1,000 + 10 + 10 + 5 + 1' },
  { title: '1994', text: 'MCMXCIV = 1,000 + 900 + 90 + 4' },
  { title: '49', text: 'XLIX = 40 + 9. It is not IL, as I can only come before V and X.' },
];

export const faqs = [
  {
    question: 'Why does it stop at 3,999?',
    answer: 'Standard Roman numerals have no symbol above M, and M can only repeat three times, so MMMCMXCIX (3,999) is the largest.',
  },
  {
    question: 'Is IIII correct?',
    answer: 'Some clock faces use IIII, but the standard form is IV. The converter points out non-standard numerals and suggests the correct one.',
  },
  {
    question: 'Is there a Roman numeral for zero?',
    answer: 'No. The Roman system had no zero or negative numbers.',
  },
  {
    question: 'Can I use small letters?',
    answer: 'Yes. mmxxvi is read the same as MMXXVI.',
  },
];
