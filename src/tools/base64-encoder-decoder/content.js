export const howItWorks = [
  { title: 'Choose an action', text: 'Select Encode to turn text into Base64, or Decode to turn Base64 back into text.' },
  { title: 'Add your text', text: 'The result updates as you type. Decoding accepts standard and URL-safe Base64, with or without padding.' },
  { title: 'Copy the result', text: 'Copy it into your code, config or request.' },
];

export const formulas = [
  { title: 'How it works', text: 'Your text becomes UTF-8 bytes. Every 3 bytes become 4 characters from a set of 64.' },
  { title: 'Size', text: 'The result is about 33% larger than the original, so Base64 is not a way to compress data.' },
  { title: 'URL-safe', text: 'Replaces + with - and / with _, and removes the = padding, so the result is safe in web addresses.' },
];

export const examples = [
  { title: 'Plain text', text: '“Hello” encodes to SGVsbG8=.' },
  { title: 'An emoji', text: '“😀” encodes to 8J+YgA==, or 8J-YgA in URL-safe form.' },
  { title: 'Decoding', text: 'SGVsbG8= decodes back to “Hello”.' },
];

export const faqs = [
  {
    question: 'Is Base64 encryption?',
    answer: 'No. Anyone can decode it, so never use it to protect passwords or private data.',
  },
  {
    question: 'Why does decoding say it is binary data?',
    answer: 'The Base64 holds something other than UTF-8 text, such as an image or a file, so it cannot be shown as text.',
  },
  {
    question: 'Does it support other languages?',
    answer: 'Yes. Text is encoded as UTF-8, so Hindi, emoji and all other scripts work in both directions.',
  },
  {
    question: 'Is my text sent anywhere?',
    answer: 'No. The conversion runs in your browser.',
  },
];
