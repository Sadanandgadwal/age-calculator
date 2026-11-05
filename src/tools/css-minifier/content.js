export const howItWorks = [
  { title: 'Paste your CSS', text: 'Add a stylesheet or a snippet.' },
  { title: 'See the saving', text: 'The minified CSS and the size saved update as you type.' },
  { title: 'Copy the result', text: 'Use it in production, and keep your original file for editing.' },
];

export const formulas = [
  { title: 'Removing', text: 'Spaces, line breaks, comments and final semicolons that browsers do not need are removed.' },
  { title: 'Shortening', text: 'Values are written in shorter forms, so margin: 0 0 0 0 becomes margin:0, and #ffffff becomes #fff.' },
  { title: 'Merging', text: 'With the option on, rules with the same declarations are combined, keeping the order that affects how your styles apply.' },
];

export const examples = [
  { title: 'A simple rule', text: 'a { color: #ffffff; } becomes a{color:#fff}.' },
  { title: 'Merging rules', text: 'a { color: red } b { color: red } becomes a,b{color:red}.' },
  { title: 'A typical stylesheet', text: 'Readable CSS often shrinks by 20% to 50%, depending on its comments and repetition.' },
];

export const faqs = [
  {
    question: 'Can minifying break my styles?',
    answer: 'It is designed not to change how a page looks. To be careful, turn off rule merging and test the page after minifying.',
  },
  {
    question: 'Why am I warned that a part could not be read?',
    answer: 'The CSS has a mistake, such as a missing colon or an extra bracket. That part may be dropped, so fix the mistake the warning points to.',
  },
  {
    question: 'Are comments kept?',
    answer: 'Comments are removed, except those starting with /*!, which are usually licence notices.',
  },
  {
    question: 'Is my CSS uploaded?',
    answer: 'No. It is minified in your browser.',
  },
];
