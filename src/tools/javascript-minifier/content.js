export const howItWorks = [
  { title: 'Paste your JavaScript', text: 'Add a script or a module. Modern syntax is supported.' },
  { title: 'Choose your options', text: 'Keep both on for the smallest result, or turn them off to keep your code easier to read.' },
  { title: 'Select Minify', text: 'See the result and the bytes saved. Syntax errors show the line and column.' },
];

export const formulas = [
  { title: 'Compress code', text: 'Removes unused code and comments, and rewrites expressions in shorter forms that do the same thing.' },
  { title: 'Shorten variable names', text: 'Renames local variables to single letters. Global names are left alone, so other scripts still work.' },
  { title: 'Percent saved', text: '(Original bytes − minified bytes) ÷ original bytes × 100.' },
];

export const examples = [
  { title: 'A small function', text: 'function add(first, second) { return first + second; } becomes function add(n,d){return n+d}.' },
  { title: 'Unused code', text: 'if (false) { run(); } is removed completely.' },
  { title: 'A licence note', text: 'Comments starting with /*! or holding @license are kept.' },
];

export const faqs = [
  {
    question: 'Is my code run?',
    answer: 'No. Terser reads your code as text and rewrites it. Nothing in it is ever run, and it stays on your device.',
  },
  {
    question: 'Can minifying break my code?',
    answer: 'Rarely, but code that relies on function names or on reading its own source can behave differently. Always run your tests on the result.',
  },
  {
    question: 'Should I still keep my original file?',
    answer: 'Yes. Minified code is hard to edit, so keep the original and minify again when it changes.',
  },
  {
    question: 'Does it support TypeScript or JSX?',
    answer: 'No. Terser reads JavaScript only, so compile TypeScript or JSX first.',
  },
];
