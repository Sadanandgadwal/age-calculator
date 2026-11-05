export const howItWorks = [
  { title: 'Add your text', text: 'Paste the text you want to change.' },
  { title: 'Say what to change', text: 'Enter what to find and what to put in its place. Leave Replace with empty to delete every match.' },
  { title: 'Replace every match', text: 'Select Replace all to update the text and see how many replacements were made.' },
];

export const formulas = [
  { title: 'Plain search', text: 'Finds your exact characters, so symbols such as a full stop or bracket have no special meaning.' },
  { title: 'Whole words only', text: 'Skips matches inside longer words, so “cat” does not match “category”.' },
  { title: 'Regular expressions', text: 'Treats your search as a pattern. Use $1, $2 and so on in Replace with to reuse captured groups.' },
];

export const examples = [
  { title: 'Change a name', text: 'Find “Acme Ltd”, replace with “Acme Limited”.' },
  { title: 'Delete a word', text: 'Find “very ” and leave Replace with empty to remove it everywhere.' },
  { title: 'Reorder with a pattern', text: 'With regular expressions on, find (\\w+) (\\w+) and replace with $2 $1 to swap each pair of words.' },
];

export const faqs = [
  {
    question: 'Is the search case-sensitive?',
    answer: 'Not by default, so “apple” also finds “Apple”. Select Match case to find only the exact capitalisation.',
  },
  {
    question: 'Can a regular expression freeze the page?',
    answer: 'No. Patterns run separately from the page and are stopped after 2 seconds, with a message asking you to try a simpler one.',
  },
  {
    question: 'Does it change my original file?',
    answer: 'No. It only changes the copy shown on this page, and you copy the result yourself.',
  },
  {
    question: 'Is my text uploaded?',
    answer: 'No. The search and replace happens in your browser.',
  },
];
