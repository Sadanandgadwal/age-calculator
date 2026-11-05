export const howItWorks = [
  { title: 'Paste the text', text: 'Use plain Base64 or a full data URI. Spaces and line breaks are ignored.' },
  { title: 'See the image', text: 'The image type is detected from the data, and the picture appears right away.' },
  { title: 'Download it', text: 'Save the image as a normal file, with the right extension.' },
];

export const formulas = [
  { title: 'Detecting the type', text: 'Each image format starts with its own signature bytes, so the type comes from the data, not from any label.' },
  { title: 'Supported formats', text: 'PNG, JPG, GIF, WebP, BMP, ICO, AVIF and SVG. Your browser must also be able to display the format.' },
  { title: 'Checking the image', text: 'The download appears only after your browser has opened the image, so damaged data is reported.' },
];

export const examples = [
  { title: 'An image in a CSS file', text: 'Copy the url(...) contents from a stylesheet to see which picture it holds.' },
  { title: 'An API response', text: 'Paste an image field from a JSON response, and save it as a file.' },
  { title: 'Saved email content', text: 'Recover an inline image from the source of a saved email or HTML page.' },
];

export const faqs = [
  {
    question: 'Is my data sent anywhere?',
    answer: 'No. It is decoded in your browser and stays on your device.',
  },
  {
    question: 'Is it safe to view an SVG here?',
    answer: 'The preview shows SVG as a picture, which keeps any scripts in it from running. If the file came from someone you do not trust, be careful opening the download in other apps.',
  },
  {
    question: 'Why does it say the image is damaged?',
    answer: 'The data started like an image, but your browser could not open it. The text may be cut off, or your browser may not support the format.',
  },
  {
    question: 'What if the data URI names the wrong type?',
    answer: 'You will see a notice, and the file is saved with the type detected from the data.',
  },
];
