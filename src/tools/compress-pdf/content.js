export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device. It is read in your browser and never uploaded.' },
  { title: 'Pick a level', text: 'Light keeps the most detail, Recommended suits most files and Strong makes the smallest file.' },
  { title: 'Compress and download', text: 'You see the original size, the new size and the saving before you download.' },
];

export const formulas = [
  { title: 'What gets smaller', text: 'Photos stored as JPEG inside the PDF are scaled down to the level limit and saved again at a lower quality.' },
  { title: 'What stays the same', text: 'Text, fonts, links and drawings are not changed, so text stays sharp and selectable.' },
  { title: 'Saving', text: 'Saving % = (original size − new size) ÷ original size × 100' },
];

export const examples = [
  { title: 'A scanned document', text: 'A 12 MB scan of 10 pages often drops to 2 to 4 MB with the Recommended level.' },
  { title: 'A brochure with photos', text: 'Light keeps the photos crisp for printing while still trimming the file.' },
  { title: 'A text-only report', text: 'A PDF of plain text is already small, so the tool tells you it cannot be made smaller.' },
];

export const faqs = [
  {
    question: 'Will my text become blurry?',
    answer: 'No. Only photos are recompressed. Text and drawings are left exactly as they were, so they stay sharp and selectable.',
  },
  {
    question: 'Why did my PDF not get smaller?',
    answer: 'Some PDFs contain no photos, or their photos are already small and well compressed. The tool never gives you a bigger file, and tells you when no saving is possible.',
  },
  {
    question: 'Which photos can be compressed?',
    answer: 'Colour and greyscale JPEG photos. Other kinds of images, such as black and white scans stored in special formats or CMYK print images, are kept as they are.',
  },
  {
    question: 'Is my file uploaded?',
    answer: 'No. Everything happens in your browser, and the file never leaves your device.',
  },
  {
    question: 'Can I compress a password-protected PDF?',
    answer: 'Not directly. Remove the password with Unlock PDF first, then compress the file and add the password again with Protect PDF.',
  },
];
