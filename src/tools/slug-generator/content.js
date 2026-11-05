export const howItWorks = [
  { title: 'Enter your title', text: 'Type or paste the title of a page, post or product.' },
  { title: 'Choose a separator', text: 'Use hyphens, the usual choice for web addresses, or underscores.' },
  { title: 'Copy the slug', text: 'The slug updates as you type, ready to use in your web address.' },
];

export const formulas = [
  { title: 'Letters', text: 'Letters become lowercase and lose their accents, so “Café” becomes “cafe”. Letters in other scripts, such as Hindi, are kept.' },
  { title: 'Symbols', text: 'Punctuation and symbols are removed, and “&” becomes “and”. Apostrophes disappear without leaving a gap.' },
  { title: 'Separators', text: 'One separator goes between each word, with none at the start or end.' },
];

export const examples = [
  { title: 'A blog title', text: '“10 Tips for Better Sleep!” becomes 10-tips-for-better-sleep.' },
  { title: 'Accents and symbols', text: '“Café & Bistro” becomes cafe-and-bistro.' },
  { title: 'Apostrophes', text: '“Don’t Panic” becomes dont-panic.' },
];

export const faqs = [
  {
    question: 'What is a slug?',
    answer: 'It is the readable part of a web address that identifies a page, such as “age-calculator” in toolnest.com/age-calculator.',
  },
  {
    question: 'Should I use hyphens or underscores?',
    answer: 'Hyphens. Google’s URL guidance recommends hyphens over underscores to separate words.',
  },
  {
    question: 'Can I keep non-English characters?',
    answer: 'Yes. Scripts such as Hindi stay in the slug. Browsers may display them encoded when the address is copied, which still works.',
  },
  {
    question: 'How long should a slug be?',
    answer: 'There is no fixed limit, but short slugs with the main words of your title are easier to read and share.',
  },
];
