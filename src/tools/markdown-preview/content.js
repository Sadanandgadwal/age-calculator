export const howItWorks = [
  { title: 'Write your Markdown', text: 'Type or paste Markdown, such as the text of a README.' },
  { title: 'See the preview', text: 'The formatted page updates as you type.' },
  { title: 'Copy the HTML', text: 'Copy results gives you the clean HTML, ready to paste into a page.' },
];

export const formulas = [
  { title: 'Basics', text: '# makes a heading, **bold** makes bold text, *italic* makes italic, and - starts a list.' },
  { title: 'Links and images', text: '[text](url) makes a link and ![alt](url) an image. Remote images show only their alt text here.' },
  { title: 'GitHub features', text: 'Tables, task lists with - [ ], ~~strikethrough~~ and fenced code blocks are supported.' },
];

export const examples = [
  { title: 'A heading and list', text: '“# Plan”, then “- First” and “- Second”, gives a heading with a bullet list.' },
  { title: 'A table', text: '| Name | Age | on one line, |---|---| on the next, then one line per row.' },
  { title: 'A code block', text: 'Put three backticks on the lines before and after your code.' },
];

export const faqs = [
  {
    question: 'Is it safe to preview Markdown from someone else?',
    answer: 'Yes. Scripts, event handlers, styles and embedded content are removed before anything is displayed.',
  },
  {
    question: 'Why don’t my images show?',
    answer: 'Loading a remote image would tell that server you visited, and your text stays private here. Images embedded as data URLs do show.',
  },
  {
    question: 'Will it look the same on GitHub?',
    answer: 'It will be very close, as it follows GitHub-style Markdown. Each site has its own styling and some special features of its own.',
  },
  {
    question: 'Is my text uploaded?',
    answer: 'No. It is converted in your browser.',
  },
];
