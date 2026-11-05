export const howItWorks = [
  { title: 'Paste your JSON', text: 'Add JSON from an API response, a log or a config file.' },
  { title: 'Choose an indent', text: 'Use 2 spaces, 4 spaces or tabs, and sort the keys if you want to compare two files.' },
  { title: 'Copy the result', text: 'The formatted JSON updates as you type. If the JSON has a mistake, you see the line and column.' },
];

export const formulas = [
  { title: 'Layout', text: 'Each key and array item goes on its own line, indented by its depth. Empty objects and arrays stay on one line.' },
  { title: 'Sorting keys', text: 'Sorts keys at every level by character code. Array items keep their order, as order has meaning in an array.' },
  { title: 'Exact values', text: 'Numbers and strings are kept exactly as written, so 12345678901234567890 and 1.10 are not rounded or changed.' },
];

export const examples = [
  { title: 'An API response', text: '{"id":1,"tags":["a","b"]} becomes four indented levels that are easy to read.' },
  { title: 'Comparing two files', text: 'Format both with sorted keys, so that key order no longer shows up as a difference.' },
  { title: 'Finding a mistake', text: 'A trailing comma or a missing quote shows the line and column where the problem is.' },
];

export const faqs = [
  {
    question: 'Is my JSON uploaded?',
    answer: 'No. It is processed in your browser and never leaves your device, so it is safe to use with private data.',
  },
  {
    question: 'Why do some formatters change my long numbers?',
    answer: 'JavaScript rounds numbers above about 16 digits when it reads JSON. This tool keeps the original digits by not converting them.',
  },
  {
    question: 'Does it accept comments or single quotes?',
    answer: 'No. These are not part of the JSON standard, so they show as errors. Remove them to make the JSON valid.',
  },
  {
    question: 'What is the difference between this and the JSON Validator?',
    answer: 'This tool gives you tidy text. The JSON Validator tells you whether your JSON is valid and describes its structure, such as repeated keys.',
  },
];
