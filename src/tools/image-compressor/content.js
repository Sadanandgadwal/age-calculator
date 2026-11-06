export const howItWorks = [
  { title: 'Choose an image', text: 'Pick a photo or picture from your device, or drop it on the page.' },
  { title: 'Set the quality', text: 'Choose JPEG or WebP, then move the slider. The result updates as you go.' },
  { title: 'Compare and download', text: 'See the sizes before and after, check the picture, and save it.' },
];

export const formulas = [
  { title: 'How it gets smaller', text: 'JPEG and WebP discard detail that is hard to see. The lower the quality, the more they discard.' },
  { title: 'Amount saved', text: 'Saved % = (Original size − Compressed size) ÷ Original size × 100' },
  { title: 'PNG files', text: 'PNG keeps every detail, so its size cannot be reduced with a quality setting. PNG images are converted to JPEG or WebP here.' },
];

export const examples = [
  { title: 'A phone photo', text: 'A photo of several MB usually drops well below 1 MB at 75% quality, ready for an email or form.' },
  { title: 'An upload limit', text: 'If a form rejects your picture for being too large, lower the quality until it fits.' },
  { title: 'A faster website', text: 'Save site images as WebP to help pages load more quickly.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. It is compressed in your browser and stays on your device.',
  },
  {
    question: 'Why can the result be larger than my original?',
    answer: 'An image that is already compressed, or a simple graphic, may not shrink further. The tool tells you when this happens, so you can keep your original.',
  },
  {
    question: 'Does it remove photo details such as location?',
    answer: 'Yes. Saving a new image leaves out metadata such as camera details and GPS location. Your original file is not changed.',
  },
  {
    question: 'Why does WebP show an error in my browser?',
    answer: 'Some browsers, including Safari, can display WebP but cannot create it. Choose JPEG there.',
  },
  {
    question: 'Can I compress many images at once?',
    answer: 'Not yet. This tool works on one image at a time.',
  },
];
