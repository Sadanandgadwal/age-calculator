export const howItWorks = [
  { title: 'Open the page', text: 'Your display details appear straight away, with nothing to enter.' },
  { title: 'Resize your window', text: 'The browser window size updates as you resize it or rotate your device.' },
  { title: 'Share the details', text: 'Copy them into a support request or a bug report, where they often help.' },
];

export const formulas = [
  { title: 'Screen resolution', text: 'The width and height your browser reports, in CSS pixels. This can be lower than the number on the box, as explained below.' },
  { title: 'Pixel ratio', text: 'How many physical pixels make up one CSS pixel. A value of 2 is typical of sharp phone and laptop screens.' },
  { title: 'Physical pixels', text: 'Screen width and height × pixel ratio. It is an estimate, as zoom and display scaling also change the ratio.' },
];

export const examples = [
  { title: 'A 1080p monitor', text: 'At 100% scaling, it shows 1,920 × 1,080 with a pixel ratio of 1.' },
  { title: 'A monitor at 125% scaling', text: 'The same monitor shows about 1,536 × 864 with a pixel ratio of 1.25.' },
  { title: 'A phone', text: 'It might show 390 × 844 with a pixel ratio of 3, which is about 1,170 × 2,532 physical pixels.' },
];

export const faqs = [
  {
    question: 'Why is this different from my monitor’s advertised resolution?',
    answer: 'Your operating system scales the display to keep text readable, and browsers report the scaled size. Multiply by the pixel ratio for an estimate of the real pixels.',
  },
  {
    question: 'Why did the numbers change when I zoomed the page?',
    answer: 'Browser zoom changes the pixel ratio and window size. Reset zoom to 100% for the usual values.',
  },
  {
    question: 'Is this information stored?',
    answer: 'No. It is read in your browser and shown only to you. It is not sent or saved.',
  },
  {
    question: 'Which number matters for web design?',
    answer: 'The browser window size, as layouts respond to the space inside the window, not the size of the whole screen.',
  },
];
