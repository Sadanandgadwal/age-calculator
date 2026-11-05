export const howItWorks = [
  { title: 'Choose an image', text: 'Pick a file from your device, or drop it on the page.' },
  { title: 'Pick a format', text: 'Get a data URI, plain Base64, an HTML image tag or a CSS background.' },
  { title: 'Copy or download', text: 'Copy the text straight into your code, or save it as a text file.' },
];

export const formulas = [
  { title: 'What Base64 is', text: 'A way to write any file using only letters, numbers and a few symbols, so it can sit inside text.' },
  { title: 'The size increase', text: 'Every 3 bytes become 4 characters, so the text is about 33% longer than the image file.' },
  { title: 'A data URI', text: 'The Base64 text with a short prefix naming the image type, which browsers can show like a normal image.' },
];

export const examples = [
  { title: 'A small icon', text: 'Put a tiny icon directly in a CSS file, so the page makes one less request.' },
  { title: 'An email signature', text: 'Include a logo in an HTML snippet without hosting the file. Some email apps block these, so test first.' },
  { title: 'A test fixture', text: 'Keep a sample image inside a test or a JSON file.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. It is read in your browser and stays on your device.',
  },
  {
    question: 'Should I use this for large images?',
    answer: 'Usually not. Base64 is about a third larger and cannot be cached separately, so it suits small images best.',
  },
  {
    question: 'Why is only part of the text shown?',
    answer: 'Very long text can slow the page, so only the start is shown. Copy and Download always give you all of it.',
  },
  {
    question: 'Does it change my image?',
    answer: 'No. The Base64 text holds the exact bytes of your file.',
  },
];
