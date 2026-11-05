export const howItWorks = [
  { title: 'Choose a format', text: 'Pick the barcode type your scanner or retailer needs.' },
  { title: 'Enter your value', text: 'The barcode updates as you type. Invalid values show what the format needs.' },
  { title: 'Download it', text: 'Save a PNG for everyday use, or an SVG for sharp printing at any size. Test-scan it before printing many.' },
];

export const formulas = [
  { title: 'Code 128 and Code 39', text: 'Code 128 is compact, and holds letters, numbers and symbols. Code 39 is older, with a smaller set of characters.' },
  { title: 'EAN-13 and UPC-A', text: 'The retail product formats. Digits are weighted 1 and 3 in turn, and the check digit brings the total to a multiple of 10.' },
  { title: 'ITF-14', text: 'A 14-digit format used on cartons and outer packaging.' },
];

export const examples = [
  { title: 'Stock labels', text: 'Use Code 128 for a value such as SKU-10482.' },
  { title: 'A retail product', text: 'EAN-13 from 590123412345 adds the check digit 7, giving 5901234123457.' },
  { title: 'An outer carton', text: 'ITF-14 from 1234567890123 adds the check digit 1.' },
];

export const faqs = [
  {
    question: 'Can I use any number for a product in shops?',
    answer: 'No. Retail barcodes need a number issued to your company by GS1. A barcode made here scans correctly, but does not register your product.',
  },
  {
    question: 'Why was my value rejected?',
    answer: 'Each format has rules. EAN-13 and UPC-A are digits only and of a fixed length, and if you enter the check digit it has to be correct.',
  },
  {
    question: 'What size should I print?',
    answer: 'Follow your scanner’s or retailer’s guidance, keep the white space on both sides, and test a printed sample. Use the SVG so that the bars stay sharp.',
  },
  {
    question: 'Is my value uploaded?',
    answer: 'No. The barcode is made in your browser.',
  },
];
