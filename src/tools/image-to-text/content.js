export const howItWorks = [
  { title: 'Choose an image', text: 'Use a clear photo, scan or screenshot with printed English text.' },
  { title: 'Wait a moment', text: 'The text reader loads once, then reads your image. Larger images take longer.' },
  { title: 'Check and copy', text: 'Review the text, then copy it or save it as a .txt file.' },
];

export const formulas = [
  { title: 'How it reads text', text: 'It uses Tesseract, an open-source OCR engine, which runs inside your browser.' },
  { title: 'Confidence', text: 'The average certainty of the reader across all words, from 0 to 100%. Below 60% means you should check the text closely.' },
  { title: 'Large images', text: 'Images are scaled so the longest side is at most 3,000 pixels, which keeps reading fast without losing normal-sized text.' },
];

export const examples = [
  { title: 'A screenshot', text: 'Get the text from an error message or a slide, without typing it again.' },
  { title: 'A printed page', text: 'Photograph a page, flat and straight in good light, to copy a paragraph.' },
  { title: 'A receipt', text: 'Copy totals and reference numbers. Small or faded print may need checking.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. The reader runs in your browser, and your image stays on your device. Only the reader files are downloaded from this site.',
  },
  {
    question: 'Which languages are supported?',
    answer: 'English only for now. Text in other languages or scripts will not be read correctly.',
  },
  {
    question: 'Can it read handwriting?',
    answer: 'Not reliably. It is designed for printed text, and handwriting usually gives poor results.',
  },
  {
    question: 'How can I get better results?',
    answer: 'Use a sharp image with good contrast, hold the camera straight above the page, and avoid shadows and glare.',
  },
  {
    question: 'Why is the first use slow?',
    answer: 'About 7 MB of reader files are downloaded the first time. Your browser keeps them, so later uses start faster.',
  },
];
