export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device. Previews of its pages appear.' },
  { title: 'Select pages', text: 'Click the pages you want, or type ranges such as 1-3, 5.' },
  { title: 'Download', text: 'Select Extract pages, then save the new PDF.' },
];

export const formulas = [
  { title: 'Page ranges', text: 'Commas separate pages and ranges. 2-4, 7 means pages 2, 3, 4 and 7, and 5- runs to the last page.' },
  { title: 'Page order', text: 'Extracted pages keep their original order. Use Reorder PDF Pages to change it.' },
  { title: 'What is kept', text: 'Pages are copied as they are, so text stays selectable and quality does not change.' },
];

export const examples = [
  { title: 'One chapter', text: 'Extract pages 12-30 from a book to share a single chapter.' },
  { title: 'A signed page', text: 'Save just the signature page of a contract as its own file.' },
  { title: 'Selected slides', text: 'Pick the slides you need from a long presentation exported as a PDF.' },
];

export const faqs = [
  {
    question: 'Is my file uploaded?',
    answer: 'No. It is processed in your browser and stays on your device.',
  },
  {
    question: 'Is my original PDF changed?',
    answer: 'No. A new PDF is created, and your original stays as it was.',
  },
  {
    question: 'Why do previews stop after page 300?',
    answer: 'Very long PDFs would slow the page. You can still select any page by typing its number.',
  },
  {
    question: 'Can I extract pages from a protected PDF?',
    answer: 'Remove the password first with Unlock PDF, using the password you already have.',
  },
];
