export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device. It is read in your browser and never uploaded.' },
  { title: 'Convert', text: 'The text on each page is joined into paragraphs, and larger lines become headings.' },
  { title: 'Download', text: 'Open the .docx file in Word, Google Docs or LibreOffice and edit it.' },
];

export const formulas = [
  { title: 'What is kept', text: 'The words on every page, in reading order, as paragraphs and headings. Each PDF page starts on a new page.' },
  { title: 'What is not kept', text: 'Layout, tables, images, columns, fonts and colours. Tables come out as lines of text.' },
  { title: 'Scanned PDFs', text: 'A scan is a picture with no text inside, so there is nothing to convert. Use Image to Text for those.' },
];

export const examples = [
  { title: 'A report or article', text: 'Text-based PDFs made from Word or a website convert into editable paragraphs.' },
  { title: 'A form or brochure', text: 'The words come across, but the design and layout do not.' },
  { title: 'A scanned letter', text: 'The tool tells you it has no text, and suggests Image to Text.' },
];

export const faqs = [
  {
    question: 'Will the Word file look like the PDF?',
    answer: 'No. This is a basic, text-only converter. It is best for getting the words out of a PDF so you can edit or reuse them.',
  },
  {
    question: 'Why does it say my PDF has no text?',
    answer: 'The PDF is probably a scan or made of pictures. Turn the pages into images with PDF to JPG, then use Image to Text to read the words.',
  },
  {
    question: 'Can I convert a password-protected PDF?',
    answer: 'Remove the password with Unlock PDF first, then convert the unlocked file.',
  },
  {
    question: 'Is my file uploaded?',
    answer: 'No. Everything happens in your browser, and the file never leaves your device.',
  },
];
