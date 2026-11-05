export const howItWorks = [
  { title: 'Paste your JSON', text: 'Add formatted JSON from a file, an API or an editor.' },
  { title: 'See it shrink', text: 'All spare spaces and line breaks are removed as you type, and the size saved is shown.' },
  { title: 'Copy one line', text: 'Copy the compact JSON into your config, request body or code.' },
];

export const formulas = [
  { title: 'What is removed', text: 'Spaces, tabs and line breaks outside strings. Spaces inside your strings are data, so they stay.' },
  { title: 'Percent saved', text: '(Original bytes − minified bytes) ÷ original bytes × 100. Sizes are measured in UTF-8.' },
  { title: 'What stays the same', text: 'Every key, value and number is kept exactly, including key order and very long numbers.' },
];

export const examples = [
  { title: 'A short object', text: '{ "a" : 1 } becomes {"a":1}, saving 4 bytes.' },
  { title: 'Strings keep their spaces', text: '{ "name": "Asha Rao" } becomes {"name":"Asha Rao"}.' },
  { title: 'A formatted file', text: 'Indented JSON often shrinks by 20% to 40%, depending on how deeply it is nested.' },
];

export const faqs = [
  {
    question: 'Is minified JSON different data?',
    answer: 'No. Programs read it exactly the same way. Only the spacing that people use for reading is removed.',
  },
  {
    question: 'Should I minify when my server uses gzip?',
    answer: 'It still helps a little, but gzip already removes most of the repetition, so the benefit is smaller than the percent shown here.',
  },
  {
    question: 'How do I make it readable again?',
    answer: 'Paste the result into the JSON Formatter, which adds the indents back.',
  },
];
