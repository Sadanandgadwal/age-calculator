export const howItWorks = [
  { title: 'Paste your text', text: 'Add text with messy spacing, such as from a PDF, an email or a web page.' },
  { title: 'Choose your options', text: 'Decide whether to trim each line, and whether to remove blank lines completely.' },
  { title: 'Copy the clean text', text: 'See how many characters were removed, then copy the result.' },
];

export const formulas = [
  { title: 'Spaces and tabs', text: 'Any run of spaces or tabs within a line becomes one space, including non-breaking spaces.' },
  { title: 'Blank lines', text: 'Several blank lines in a row become one. With the option on, all blank lines are removed.' },
  { title: 'Characters removed', text: 'Characters in your text − characters in the cleaned text.' },
];

export const examples = [
  { title: 'Double spaces', text: '“Hello   big  world” becomes “Hello big world”.' },
  { title: 'Indented lines', text: 'With trimming on, “   Dear Sir” becomes “Dear Sir”.' },
  { title: 'Gaps in a page', text: 'Three blank lines between two paragraphs become one blank line.' },
];

export const faqs = [
  {
    question: 'Will this join my lines together?',
    answer: 'No. Your line breaks stay, and only blank lines are reduced. Your paragraphs keep their shape.',
  },
  {
    question: 'Should I trim code?',
    answer: 'Turn trimming off to keep the spaces at the start of lines, though repeated spaces within lines are still reduced. For code, use a formatter instead.',
  },
  {
    question: 'Why do pasted PDFs have so many extra spaces?',
    answer: 'PDFs position text on the page instead of storing normal paragraphs, so copying can leave gaps. This tool removes those gaps.',
  },
];
