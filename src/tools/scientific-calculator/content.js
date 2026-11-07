export const howItWorks = [
  { title: 'Enter a calculation', text: 'Type it, or use the keys. You can mix both and edit anywhere in the line.' },
  { title: 'Choose the angle mode', text: 'Pick Degrees or Radians before using sin, cos, tan or their inverses.' },
  { title: 'Calculate', text: 'Select Calculate or press Enter. Ans reuses your last answer, and M+ keeps a value in memory.' },
];

export const formulas = [
  { title: 'Order of operations', text: 'Brackets first, then powers and factorials, then × and ÷, then + and −. So 2 + 3 × 4 = 14.' },
  { title: 'Powers', text: 'Powers are worked out from the right, so 2^3^2 = 2^9 = 512, and −2^2 = −4.' },
  { title: 'Degrees and radians', text: 'Radians = degrees × π ÷ 180. In Degrees mode, sin(30) = 0.5.' },
  { title: 'Logarithms', text: 'log is base 10, so log(1000) = 3. ln is base e, so ln(e) = 1.' },
];

export const examples = [
  { title: 'Everyday maths', text: '(25 + 15) × 3 ÷ 4 = 30' },
  { title: 'Trigonometry', text: 'In Degrees mode, sin(30) + cos(60) = 1, and tan⁻¹(1) = 45.' },
  { title: 'Powers and roots', text: '√(144) + 2^10 = 1036, and 5! = 120.' },
  { title: 'Scientific notation', text: '3e8 means 3 × 10^8, so 3e8 ÷ 2 = 150000000.' },
];

export const faqs = [
  {
    question: 'Can I leave out the multiplication sign?',
    answer: 'Yes. 2π, 3(4 + 1) and (2)(5) are all treated as multiplication.',
  },
  {
    question: 'Do I need to close every bracket?',
    answer: 'No. Brackets left open at the end are closed for you, so √(16 + 9 gives 5.',
  },
  {
    question: 'Why does tan(90) show an error?',
    answer: 'In Degrees mode the tangent of 90°, 270° and so on is undefined, because the cosine is zero there. The calculator says so instead of showing a huge, misleading number.',
  },
  {
    question: 'How accurate are the answers?',
    answer: 'Answers are shown to 12 significant figures. Very large or very small answers are shown as a number times a power of 10.',
  },
  {
    question: 'Is my calculation sent anywhere?',
    answer: 'No. Everything is worked out in your browser.',
  },
];
