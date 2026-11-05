export const howItWorks = [
  { title: 'Paste your JSON', text: 'Add the JSON you want to check. The result updates as you type.' },
  { title: 'Read the result', text: 'See straight away whether it is valid. If not, you get the line and column of the first error.' },
  { title: 'Check the structure', text: 'For valid JSON, see how many objects, arrays and keys it has, how deep it goes, and any repeated keys.' },
];

export const formulas = [
  { title: 'What counts as valid', text: 'JSON must follow the RFC 8259 standard: double-quoted keys and strings, no trailing commas and no comments.' },
  { title: 'Repeated keys', text: 'A key used twice in one object is allowed by the parser, but most programs keep only the last value, so it is flagged.' },
  { title: 'Deepest level', text: 'How many levels of nesting there are. A plain value is level 1, and each object or array inside adds a level.' },
];

export const examples = [
  { title: 'A trailing comma', text: '{"a":1,} is invalid, as no key follows the comma.' },
  { title: 'Single quotes', text: "{'a':1} is invalid, as JSON needs double quotes." },
  { title: 'A repeated key', text: '{"a":1,"a":2} is valid but flagged, as the first value would usually be lost.' },
];

export const faqs = [
  {
    question: 'Why is only the first error shown?',
    answer: 'A parser stops at its first error, as everything after it can no longer be read reliably. Fix it, and the next one appears.',
  },
  {
    question: 'Why does the error message look technical?',
    answer: 'The line and column come from this tool, while the second line is your browser’s own message. It can differ between browsers.',
  },
  {
    question: 'Does it check against a schema?',
    answer: 'No. It checks that the JSON is correctly written, not that it has the fields your program expects.',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes. The check runs in your browser, and nothing is sent or stored.',
  },
];
