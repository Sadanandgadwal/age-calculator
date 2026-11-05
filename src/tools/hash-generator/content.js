export const howItWorks = [
  { title: 'Add your text', text: 'Type or paste your text. Every hash updates as you type.' },
  { title: 'Compare or copy', text: 'Copy a hash to compare it with a published checksum, or to use it in your code.' },
  { title: 'Choose a strong one', text: 'Use SHA-256 or stronger where security matters. MD5 and SHA-1 are here for older systems.' },
];

export const formulas = [
  { title: 'What a hash is', text: 'A fixed-length fingerprint of your data. Changing one character gives a completely different result.' },
  { title: 'Output sizes', text: 'MD5 is 128 bits, SHA-1 is 160, SHA-256 is 256, SHA-384 is 384 and SHA-512 is 512. Each hex digit holds 4 bits.' },
  { title: 'Encoding', text: 'Your text is hashed as UTF-8 bytes, so the results match most other tools. A trailing line break changes the result.' },
];

export const examples = [
  { title: '“abc” in MD5', text: '900150983cd24fb0d6963f7d28e17f72' },
  { title: '“abc” in SHA-1', text: 'a9993e364706816aba3e25717850c26c9cd0d89d' },
  { title: '“abc” in SHA-256', text: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
];

export const faqs = [
  {
    question: 'Can a hash be turned back into the text?',
    answer: 'Not directly, as hashing is one-way. Short or common text can still be guessed by trying many values, so hashing does not hide simple secrets.',
  },
  {
    question: 'Should I store passwords with these hashes?',
    answer: 'No. Passwords need a slow, salted algorithm such as Argon2 or bcrypt. These hashes are built to be fast, which helps an attacker.',
  },
  {
    question: 'Why doesn’t my hash match another tool’s?',
    answer: 'It is usually a hidden space or line break at the end of the text. Other tools may also use a different text encoding.',
  },
  {
    question: 'Is my text sent anywhere?',
    answer: 'No. The hashes are worked out in your browser.',
  },
];
