export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device. Previews of its pages appear in order.' },
  { title: 'Rearrange', text: 'Drag pages to new places, or use the arrow buttons. Reverse order flips the whole document.' },
  { title: 'Save', text: 'Select Save new order, then download the PDF.' },
];

export const formulas = [
  { title: 'What changes', text: 'Only the order of the pages. Each page is copied as it is, so text stays selectable.' },
  { title: 'Reverse order', text: 'The last page becomes the first, which helps with scans fed in back to front.' },
  { title: 'Long documents', text: 'Previews are shown for up to 300 pages. Pages after that show their number instead.' },
];

export const examples = [
  { title: 'Scanned backwards', text: 'Use Reverse order when a stack of pages was scanned from the last page.' },
  { title: 'A missing page found', text: 'Move a page that was scanned late into its right place.' },
  { title: 'A summary first', text: 'Move the summary page to the front of a report.' },
];

export const faqs = [
  {
    question: 'Is my file uploaded?',
    answer: 'No. It is processed in your browser and stays on your device.',
  },
  {
    question: 'Can I use it without a mouse?',
    answer: 'Yes. Each page has buttons to move it earlier or later, which work with the keyboard and on touch screens.',
  },
  {
    question: 'Is my original PDF changed?',
    answer: 'No. A new PDF is created in the new order.',
  },
  {
    question: 'Can I reorder a protected PDF?',
    answer: 'Remove the password first with Unlock PDF, using the password you already have.',
  },
];
