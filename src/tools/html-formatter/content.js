export const howItWorks = [
  { title: 'Paste your HTML', text: 'Add a page, a snippet or minified HTML.' },
  { title: 'Choose an indent', text: 'Use 2 spaces, 4 spaces or tabs.' },
  { title: 'Copy the result', text: 'The tidy HTML updates as you type, ready to paste into your editor.' },
];

export const formulas = [
  { title: 'Nesting', text: 'Each element inside another is indented one more level, so the structure is easy to follow.' },
  { title: 'Inline text', text: 'Inline elements such as <b> and <a> stay within their line of text, as adding spaces there could change how the page looks.' },
  { title: 'Scripts and styles', text: 'The contents of script and style tags are kept and indented, but not reformatted.' },
];

export const examples = [
  { title: 'Minified HTML', text: '<ul><li>One</li><li>Two</li></ul> becomes three indented lines inside the list.' },
  { title: 'A copied snippet', text: 'Tidy markup copied from a browser’s developer tools.' },
  { title: 'Mixed indents', text: 'A file with a mix of tabs and spaces comes out with one consistent indent.' },
];

export const faqs = [
  {
    question: 'Will it run my scripts?',
    answer: 'No. Your HTML is handled purely as text, and the result is shown as text, so nothing in it is run or loaded.',
  },
  {
    question: 'Does it fix broken HTML?',
    answer: 'No. It only changes the spacing. Missing closing tags stay missing, so the indents may look uneven around them.',
  },
  {
    question: 'Could formatting change how my page looks?',
    answer: 'Rarely. Spaces between inline elements can affect layout, so check any page where exact spacing matters.',
  },
  {
    question: 'Is my HTML uploaded?',
    answer: 'No. It is formatted in your browser.',
  },
];
