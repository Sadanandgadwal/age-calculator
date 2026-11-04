export const howItWorks = [
  { title: 'Paste your list', text: 'Add your text with one item on each line, such as email addresses or names.' },
  { title: 'Choose your options', text: 'Decide whether “Apple” and “apple” count as the same, and whether to ignore extra spaces.' },
  { title: 'Copy the clean list', text: 'The first of each line stays where it was, and later repeats are removed.' },
];

export const formulas = [
  { title: 'What counts as a repeat', text: 'A line that exactly matches an earlier line. The options loosen this to ignore capital letters or extra spaces.' },
  { title: 'Which line stays', text: 'The first one, written exactly as you typed it. The order of your list does not change.' },
  { title: 'Lines removed', text: 'Original lines − lines kept.' },
];

export const examples = [
  { title: 'A simple list', text: 'Apple, Pear, Apple, Plum becomes Apple, Pear, Plum, with 1 line removed.' },
  { title: 'Ignoring capital letters', text: 'With the option on, “Apple” and “APPLE” count as a repeat, and “Apple” stays.' },
  { title: 'Ignoring extra spaces', text: 'With the option on, “New  York ” and “New York” count as a repeat.' },
];

export const faqs = [
  {
    question: 'What happens to blank lines?',
    answer: 'A second blank line counts as a repeat, so only the first is kept. Select Remove blank lines to remove them all.',
  },
  {
    question: 'Is the list sorted?',
    answer: 'No. Your order stays the same. To sort it as well, use the Text Sorter on the result.',
  },
  {
    question: 'Is it safe for a list of email addresses?',
    answer: 'Yes. The list is processed in your browser, and is not uploaded or saved.',
  },
];
