export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device, or drop it on the page.' },
  { title: 'Choose how to split', text: 'Type ranges such as 1-3, 4-6, split every few pages, or make one file per page.' },
  { title: 'Download', text: 'One part downloads as a PDF. Several parts download together in a ZIP file.' },
];

export const formulas = [
  { title: 'Ranges', text: 'Each comma starts a new file. 1-3, 4-6 makes two files, and 8- runs to the last page.' },
  { title: 'Every N pages', text: 'Number of files = Pages ÷ N, rounded up. The last file may have fewer pages.' },
  { title: 'What is kept', text: 'Pages are copied as they are, so text stays selectable and quality does not change.' },
];

export const examples = [
  { title: 'Chapters', text: 'Split a 30-page report with 1-10, 11-20, 21-30 into three chapters.' },
  { title: 'Scanned forms', text: 'Split a scan of ten two-page forms with Every N pages set to 2.' },
  { title: 'Single pages', text: 'Choose Every page to get each page as its own PDF.' },
];

export const faqs = [
  {
    question: 'Is my file uploaded?',
    answer: 'No. It is split in your browser and stays on your device.',
  },
  {
    question: 'Can parts overlap?',
    answer: 'Yes. With ranges, the same page can appear in more than one file, such as 1-5, 5-10.',
  },
  {
    question: 'How do I open the ZIP file?',
    answer: 'Most computers and phones open ZIP files when you select them. The PDFs are inside.',
  },
  {
    question: 'Can I split a password-protected PDF?',
    answer: 'Remove the password first with Unlock PDF, using the password you already have.',
  },
];
