export const howItWorks = [
  { title: 'Paste your list', text: 'Add your text with one item on each line.' },
  { title: 'Choose an order', text: 'Sort from A to Z, Z to A, by number or by length. The result updates straight away.' },
  { title: 'Or shuffle it', text: 'Select Shuffle lines for a random order. Select it again for a different one.' },
];

export const formulas = [
  { title: 'A to Z', text: 'Ignores capital letters and accents, and sorts numbers in text naturally, so “Item 2” comes before “Item 10”.' },
  { title: 'By number', text: 'Sorts by the number at the start of each line. Lines with no leading number go last.' },
  { title: 'By length', text: 'Puts the shortest line first. Lines of equal length are in A to Z order.' },
];

export const examples = [
  { title: 'Names', text: 'Zara, adam, Mina becomes adam, Mina, Zara.' },
  { title: 'Numbered items', text: 'Item 10, Item 2, Item 1 becomes Item 1, Item 2, Item 10.' },
  { title: 'Numbers', text: '100, 20, 3.5 sorted by number becomes 3.5, 20, 100.' },
];

export const faqs = [
  {
    question: 'Why does “Item 2” come before “Item 10”?',
    answer: 'Numbers within text are compared by value, as people expect. A strict character sort would put “Item 10” first.',
  },
  {
    question: 'Is the shuffle really random?',
    answer: 'It uses your browser’s secure random number generator with a Fisher–Yates shuffle, so every order is equally likely.',
  },
  {
    question: 'Can I also remove repeated lines?',
    answer: 'Use Remove Duplicate Lines on your list first, then sort the result here.',
  },
];
