export const howItWorks = [
  { title: 'Add your text', text: 'Type or paste the text you want to reverse.' },
  { title: 'Choose what to reverse', text: 'Reverse every character, the order of the words on each line, or the order of the lines.' },
  { title: 'Use the result', text: 'The reversed text updates as you type, ready to copy.' },
];

export const formulas = [
  { title: 'Characters', text: 'The whole text is mirrored from the last character to the first, including line breaks.' },
  { title: 'Words', text: 'The words on each line swap order, and the spacing between them is kept. The lines stay in place.' },
  { title: 'Lines', text: 'The last line comes first. The text within each line does not change.' },
];

export const examples = [
  { title: 'Characters', text: '“Hello” becomes “olleH”.' },
  { title: 'Words', text: '“one two three” becomes “three two one”.' },
  { title: 'Lines', text: 'A list of January, February, March becomes March, February, January.' },
];

export const faqs = [
  {
    question: 'Do emoji stay intact?',
    answer: 'Yes. Emoji and accented letters are treated as single characters, so they are not broken when reversed.',
  },
  {
    question: 'What happens to punctuation in word mode?',
    answer: 'It stays attached to its word, so “Hello, world!” becomes “world! Hello,”.',
  },
  {
    question: 'Can this flip a list that is in the wrong order?',
    answer: 'Yes. Use Lines to turn a list upside down, such as to put oldest entries first.',
  },
];
