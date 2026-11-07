export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device. Every page is selected to begin with.' },
  { title: 'Rotate', text: 'Select the pages to turn, then choose Left, Right or 180°. The previews show the result.' },
  { title: 'Save', text: 'Select Save rotated PDF, then download it.' },
];

export const formulas = [
  { title: 'How rotation works', text: 'Each page is given a new viewing angle of 0, 90, 180 or 270 degrees, added to any rotation it already had.' },
  { title: 'Quality', text: 'The page content itself is not changed, so text stays sharp and selectable.' },
  { title: 'Page ranges', text: 'Type ranges such as 2, 4-6 to select pages quickly, or click the previews.' },
];

export const examples = [
  { title: 'A sideways scan', text: 'Select all pages and choose Right to fix a document scanned the wrong way.' },
  { title: 'One landscape table', text: 'Select just that page and turn it so it reads the same way as the rest.' },
  { title: 'Upside-down pages', text: 'Select the pages that were fed in upside down and choose 180°.' },
];

export const faqs = [
  {
    question: 'Is my file uploaded?',
    answer: 'No. It is processed in your browser and stays on your device.',
  },
  {
    question: 'Does rotating lower the quality?',
    answer: 'No. Only the page angle changes, and the content stays exactly the same.',
  },
  {
    question: 'Can I rotate by any angle?',
    answer: 'PDF pages can only be turned in steps of 90 degrees.',
  },
  {
    question: 'Can I rotate a protected PDF?',
    answer: 'Remove the password first with Unlock PDF, using the password you already have.',
  },
];
