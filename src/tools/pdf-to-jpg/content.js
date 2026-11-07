export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device, or drop it on the page.' },
  { title: 'Pick quality and pages', text: 'Choose 72, 150 or 300 DPI, and leave Pages empty for all of them or type ranges.' },
  { title: 'Download', text: 'One page downloads as a JPG. Several pages download together in a ZIP file.' },
];

export const formulas = [
  { title: 'Image size', text: 'Pixels = Page size in inches × DPI. An A4 page at 150 DPI is 1240 × 1754 pixels.' },
  { title: 'Which DPI to use', text: '72 DPI suits screens and messages, 150 DPI suits most uses, and 300 DPI suits printing.' },
  { title: 'Very large pages', text: 'Images are limited to 40 megapixels, so huge pages at 300 DPI are made a little smaller.' },
];

export const examples = [
  { title: 'A slide for social media', text: 'Convert one page of a presentation at 150 DPI to post it as a picture.' },
  { title: 'A form for a chat app', text: 'Turn a one-page PDF form into a JPG that opens in any messaging app.' },
  { title: 'Print-quality images', text: 'Choose 300 DPI to get images that print sharply.' },
];

export const faqs = [
  {
    question: 'Is my file uploaded?',
    answer: 'No. Pages are converted in your browser and stay on your device.',
  },
  {
    question: 'Is the text in the images selectable?',
    answer: 'No. Each page becomes a picture. Use Image to Text if you need the words back.',
  },
  {
    question: 'Why does a page look different?',
    answer: 'Rare fonts or special effects may display slightly differently from your PDF reader.',
  },
  {
    question: 'Can I convert a protected PDF?',
    answer: 'Remove the password first with Unlock PDF, using the password you already have.',
  },
];
