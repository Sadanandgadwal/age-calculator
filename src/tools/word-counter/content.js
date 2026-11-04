export const howItWorks = [
  { title: 'Add your text', text: 'Type in the box or paste from any document. The counts update with every change.' },
  { title: 'Read the counts', text: 'See words, characters and sentences first, then paragraphs and characters without spaces.' },
  { title: 'Plan your time', text: 'See roughly how long your text takes to read silently or to speak aloud.' },
];

export const formulas = [
  { title: 'Words', text: 'Text separated by spaces or new lines, where each piece has at least one letter or digit. So a lone dash is not a word.' },
  { title: 'Sentences', text: 'Text ending in a full stop, question mark or exclamation mark followed by a space, or at the very end of your text.' },
  { title: 'Time', text: 'Words ÷ 238 words a minute for reading, and words ÷ 150 words a minute for speaking.' },
];

export const examples = [
  { title: 'A short note', text: '“Back at 5. Call me!” has 5 words and 2 sentences.' },
  { title: 'Hyphens and contractions', text: '“Well-known” and “don’t” each count as one word, as most word processors count them.' },
  { title: 'A 1,000 word article', text: 'Takes about 4 minutes 13 seconds to read and 6 minutes 40 seconds to speak.' },
];

export const faqs = [
  {
    question: 'Is my text uploaded anywhere?',
    answer: 'No. The counting happens in your browser, so your text is never sent to a server or saved.',
  },
  {
    question: 'Why does my word processor show a slightly different number?',
    answer: 'Programs treat symbols and dashes differently. This counter skips pieces with no letters or digits, such as a dash on its own, so it can be a little lower.',
  },
  {
    question: 'How accurate is the sentence count?',
    answer: 'It is a close estimate. An abbreviation such as “Dr. Rao” looks like the end of a sentence, so it can count as two.',
  },
  {
    question: 'Does it work in Hindi and other languages?',
    answer: 'Yes, for any language that separates words with spaces. The Hindi full stop (।) also ends a sentence. Languages written without spaces, such as Chinese, are not counted accurately.',
  },
];
