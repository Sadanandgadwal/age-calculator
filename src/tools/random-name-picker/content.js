export const howItWorks = [
  { title: 'Add your names', text: 'Paste a list with one name on each line. Blank lines are skipped.' },
  { title: 'Choose how many', text: 'Pick one winner, or several. Nobody is picked twice in the same draw.' },
  { title: 'Select Pick', text: 'See the winners straight away. Select Pick again for a new draw from the full list.' },
];

export const formulas = [
  { title: 'Fair draw', text: 'The list is shuffled using a Fisher–Yates shuffle with secure randomness, then the first names are taken.' },
  { title: 'Equal chances', text: 'With 50 names and 1 winner, each name has a 1 in 50 chance, wherever it sits in the list.' },
  { title: 'Repeated names', text: 'With the option on, identical lines count once. Turn it off to give someone more entries, such as raffle tickets.' },
];

export const examples = [
  { title: 'A giveaway', text: 'Paste your entrants and pick 3 winners. The first picked can take first prize.' },
  { title: 'A classroom', text: 'Paste the class list to choose who answers next.' },
  { title: 'A raffle', text: 'Turn off the option and list a name once for each ticket held.' },
];

export const faqs = [
  {
    question: 'Is my list stored or uploaded?',
    answer: 'No. The draw happens in your browser, so the names stay on your device.',
  },
  {
    question: 'Can I prove a draw was fair?',
    answer: 'Not on its own, as the page keeps no record. For a public draw, share your screen or record it, and print the result.',
  },
  {
    question: 'Are “Asha” and “asha” the same name?',
    answer: 'No. Only lines that match exactly count as repeats, so tidy your list first if capitals vary.',
  },
];
