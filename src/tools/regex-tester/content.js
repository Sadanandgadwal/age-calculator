export const howItWorks = [
  { title: 'Enter a pattern', text: 'Type your regular expression without the slashes, such as \\d+ for numbers.' },
  { title: 'Add test text', text: 'Matches are highlighted as you type, with their position and any capture groups.' },
  { title: 'Adjust the flags', text: 'Turn options on or off, such as ignoring capital letters, to see how the matches change.' },
];

export const formulas = [
  { title: 'Syntax', text: 'Uses JavaScript regular expressions, as run by your browser. Other languages differ in places, so test in your target language too.' },
  { title: 'Common symbols', text: '. any character, \\d digit, \\w word character, \\s space, * zero or more, + one or more, ? optional.' },
  { title: 'Groups', text: 'Round brackets capture text, as in (\\d+). Use (?<name>\\d+) for a named group.' },
];

export const examples = [
  { title: 'Find numbers', text: '\\d+ finds 2026 and 15 in “On 15 May 2026”.' },
  { title: 'Split a date', text: '(\\d{4})-(\\d{2}) on 2026-11 gives groups 2026 and 11.' },
  { title: 'Named groups', text: '(?<user>\\w+)@ on asha@example.com gives user: asha.' },
];

export const faqs = [
  {
    question: 'What happens if my pattern is very slow?',
    answer: 'Patterns run separately from the page and stop after 2 seconds, so your browser stays responsive. Nested repeats such as (a+)+ are a common cause.',
  },
  {
    question: 'Why does only one match show?',
    answer: 'The “Find all matches” option is off. Turn it on to see every match.',
  },
  {
    question: 'Why is my pattern valid elsewhere but not here?',
    answer: 'Each language has its own regex features, and some do not exist in JavaScript. The error message says what could not be read.',
  },
  {
    question: 'Is my text sent anywhere?',
    answer: 'No. The pattern and text are processed in your browser.',
  },
];
