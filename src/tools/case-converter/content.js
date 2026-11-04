export const howItWorks = [
  { title: 'Add your text', text: 'Type or paste the text you want to change.' },
  { title: 'Choose a case', text: 'Select a case above the box. The result updates straight away, and you can switch as often as you like.' },
  { title: 'Use the result', text: 'Copy the converted text and paste it wherever you need it.' },
];

export const formulas = [
  { title: 'Title and sentence case', text: 'Title Case capitalises the first letter of every word. Sentence case capitalises the first letter after a full stop, question mark, exclamation mark or new line.' },
  { title: 'camelCase', text: 'Joins the words with no spaces, with a capital starting each word after the first.' },
  { title: 'snake_case and kebab-case', text: 'Lowercase words joined with underscores or hyphens. Punctuation is removed, and each line is converted separately.' },
];

export const examples = [
  { title: 'Title Case', text: '“the quick brown fox” becomes “The Quick Brown Fox”.' },
  { title: 'Sentence case', text: '“HELLO THERE. HOW ARE YOU?” becomes “Hello there. How are you?”.' },
  { title: 'For code', text: '“user first name” becomes userFirstName, user_first_name or user-first-name.' },
];

export const faqs = [
  {
    question: 'Does Title Case keep small words such as “of” in lowercase?',
    answer: 'No. Every word is capitalised, as style guides disagree about which small words to leave. Adjust those by hand if your style guide needs it.',
  },
  {
    question: 'Will Sentence case keep names capitalised?',
    answer: 'No. It lowers everything first, so names and acronyms need capitalising again afterwards.',
  },
  {
    question: 'Can it convert existing code names?',
    answer: 'Yes. It splits words at capitals, spaces, hyphens and underscores, so userFirstName converts to user_first_name.',
  },
  {
    question: 'Is my text sent anywhere?',
    answer: 'No. The conversion happens in your browser.',
  },
];
