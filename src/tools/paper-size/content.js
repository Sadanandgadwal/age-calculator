export const howItWorks = [
  { title: 'Choose a paper size', text: 'Pick from the A and B series, common envelopes, or North American sizes such as Letter and Legal.' },
  { title: 'Set the orientation', text: 'Portrait is tall and landscape is wide. The sizes swap round to match.' },
  { title: 'Pick a resolution', text: 'See the pixel size for printing or scanning at 72 to 600 DPI.' },
];

export const formulas = [
  { title: 'Inches', text: 'Inches = millimetres ÷ 25.4' },
  { title: 'Points', text: 'Points = inches × 72, the unit used in PDFs and design software.' },
  { title: 'Pixels', text: 'Pixels = inches × DPI, rounded to the nearest pixel.' },
];

export const examples = [
  { title: 'A4 at 300 DPI', text: '210 × 297 mm is 8.27 × 11.69 in, or 2,480 × 3,508 pixels for print-quality artwork.' },
  { title: 'Letter in landscape', text: '11 × 8.5 in, which is 792 × 612 points in a PDF.' },
  { title: 'A series halves', text: 'Folding A3 (297 × 420 mm) in half gives A4 (210 × 297 mm).' },
];

export const faqs = [
  {
    question: 'Why does each A size have the same shape?',
    answer: 'The sides are in the ratio 1 : √2, so cutting a sheet in half gives the next size down with the same proportions.',
  },
  {
    question: 'Which DPI should I use?',
    answer: '300 DPI is standard for printing photos and documents. 150 DPI is fine for drafts, and 72 or 96 DPI matches older screen settings.',
  },
  {
    question: 'Is Letter the same as A4?',
    answer: 'No. Letter is 6 mm wider and 18 mm shorter than A4. India and most countries use A4, while the US and Canada use Letter.',
  },
  {
    question: 'Are the sizes exact?',
    answer: 'The millimetre sizes are the official ones. Other units are rounded to two decimal places, and pixels to whole numbers.',
  },
];
