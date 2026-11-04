export const howItWorks = [
  { title: 'Enter your text or link', text: 'Type a web address, a phone number or any short text. The code updates as you type.' },
  { title: 'Choose error correction', text: 'Medium suits most uses. Choose a higher level if the code may get scratched or dirty.' },
  { title: 'Download your code', text: 'Save it as a PNG for everyday use, or as an SVG for sharp printing at any size.' },
];

export const formulas = [
  { title: 'Error correction', text: 'Lets a scanner read a damaged code. The level is roughly how much of the code can be lost and still be read.' },
  { title: 'Size', text: 'More text or more error correction means more squares, so the code needs printing larger.' },
  { title: 'Border', text: 'Each code includes a clear border four squares wide, as the QR standard requires for reliable scanning.' },
];

export const examples = [
  { title: 'A website', text: 'Enter https://example.com to send people straight to your site.' },
  { title: 'A phone number', text: 'Enter tel:+919876543210 to let people call with one tap.' },
  { title: 'A poster', text: 'Download the SVG and choose High error correction for outdoor printing.' },
];

export const faqs = [
  {
    question: 'Do these QR codes expire?',
    answer: 'No. Your text is stored in the code itself, with no redirect service, so it keeps working for as long as the link inside it does.',
  },
  {
    question: 'Can I track scans?',
    answer: 'No. These are plain codes that go straight to your link, so nothing is counted or recorded.',
  },
  {
    question: 'How much text fits in a QR code?',
    answer: 'Up to about 2,900 characters of plain English at Low error correction, and fewer at higher levels. Short codes are much easier to scan.',
  },
  {
    question: 'Is my text sent to a server?',
    answer: 'No. The code is made in your browser.',
  },
];
