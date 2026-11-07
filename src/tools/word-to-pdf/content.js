export const howItWorks = [
  { title: 'Choose a Word file', text: 'Pick a .docx document. It is read in your browser and never uploaded.' },
  { title: 'Convert', text: 'Text, headings, bold and italic, lists, tables and pictures are placed on A4 pages.' },
  { title: 'Download', text: 'Check the summary of what was converted, then download the PDF.' },
];

export const formulas = [
  { title: 'What is kept', text: 'Paragraphs, headings, bold, italic, underline, links, bulleted and numbered lists, tables, and PNG or JPEG pictures.' },
  { title: 'What is not kept', text: 'Page layout, headers and footers, page numbers, text colours, columns, text boxes and the exact fonts. The PDF uses a clean standard layout instead.' },
  { title: 'Page setup', text: 'Pages are A4 with 2.5 cm margins and 11 pt text.' },
];

export const examples = [
  { title: 'A letter or essay', text: 'Plain documents with headings and paragraphs convert closely to the original.' },
  { title: 'A report with tables', text: 'Tables keep their rows and columns, with equal column widths.' },
  { title: 'A designed flyer', text: 'Layouts built with text boxes and columns will not match. Use Save as PDF in Word for those.' },
];

export const faqs = [
  {
    question: 'Will the PDF look exactly like my Word document?',
    answer: 'No. This is a basic converter that keeps the content and structure, not the exact design. For an exact copy, use Save as PDF or Print to PDF in Word.',
  },
  {
    question: 'Can I convert an old .doc file?',
    answer: 'No. Only the newer .docx format is supported. Open the file in Word and save it as .docx first.',
  },
  {
    question: 'Does it work with Hindi or other Indian languages?',
    answer: 'Not yet. The built-in font covers English and most European languages. If your document uses other scripts, the tool warns you that some text will be missing.',
  },
  {
    question: 'Is my document uploaded?',
    answer: 'No. The conversion happens in your browser, and the file never leaves your device.',
  },
];
