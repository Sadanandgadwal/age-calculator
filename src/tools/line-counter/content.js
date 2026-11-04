export const howItWorks = [
  { title: 'Paste your text', text: 'Add a list, a log file, code or anything else with several lines.' },
  { title: 'See the totals', text: 'Get the total number of lines, split into lines with content and blank lines.' },
  { title: 'Find the longest line', text: 'See which line is longest, along with the average line length.' },
];

export const formulas = [
  { title: 'Total lines', text: 'One more than the number of line breaks, so text with no line break is one line.' },
  { title: 'Blank lines', text: 'Lines that are empty or contain only spaces or tabs.' },
  { title: 'Average length', text: 'All characters on all lines ÷ the total number of lines. Blank lines are included.' },
];

export const examples = [
  { title: 'A three-item list', text: 'Three lines with no blank lines between them gives 3 total and 3 non-empty.' },
  { title: 'A blank line between two', text: 'Two lines of text with an empty line between them gives 3 total and 1 blank.' },
  { title: 'A line break at the end', text: '“One”, then Enter, gives 2 lines. The empty last line counts as blank.' },
];

export const faqs = [
  {
    question: 'Why is the count one higher than I expected?',
    answer: 'Text that ends with a line break has an empty line after it, which counts. The Non-Empty Lines figure leaves it out.',
  },
  {
    question: 'Are long wrapped lines counted as one?',
    answer: 'Yes. A line only ends where there is a line break, however it wraps on your screen.',
  },
  {
    question: 'Can I count lines of code?',
    answer: 'Yes. Paste your code and use Non-Empty Lines to leave out blank ones. Comment lines are still counted.',
  },
];
