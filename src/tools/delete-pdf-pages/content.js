export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device. Previews of its pages appear.' },
  { title: 'Select pages to delete', text: 'Click the pages to remove, or type ranges such as 2, 5-7.' },
  { title: 'Download', text: 'Select Delete pages, then save the shorter PDF.' },
];

export const formulas = [
  { title: 'Pages left', text: 'Pages left = Total pages − Pages selected. At least one page must stay.' },
  { title: 'Page ranges', text: 'Commas separate pages and ranges. 2, 5-7 removes pages 2, 5, 6 and 7.' },
  { title: 'What is kept', text: 'The remaining pages are copied as they are, in their original order.' },
];

export const examples = [
  { title: 'Blank pages', text: 'Remove the blank pages a scanner added between double-sided pages.' },
  { title: 'A cover page', text: 'Delete page 1 to remove a cover before sharing a report.' },
  { title: 'Private details', text: 'Drop the pages with personal information before sending a document.' },
];

export const faqs = [
  {
    question: 'Is my file uploaded?',
    answer: 'No. It is processed in your browser and stays on your device.',
  },
  {
    question: 'Is my original PDF changed?',
    answer: 'No. A new PDF is created without the pages you chose. Your original stays as it was.',
  },
  {
    question: 'Are deleted pages really gone?',
    answer: 'Yes. They are not included in the new file at all, not just hidden.',
  },
  {
    question: 'Can I delete pages from a protected PDF?',
    answer: 'Remove the password first with Unlock PDF, using the password you already have.',
  },
];
