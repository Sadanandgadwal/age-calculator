export const howItWorks = [
  { title: 'Enter any colour code', text: 'Type a HEX code, or an RGB, HSL, HSV or CMYK value. Three numbers on their own are read as RGB.' },
  { title: 'Or pick a colour', text: 'Use the colour picker to choose a colour by eye.' },
  { title: 'Copy the format you need', text: 'Every format is shown at once, along with how readable white and black text are on the colour.' },
];

export const formulas = [
  { title: 'HEX', text: 'Each pair of hex digits is one RGB channel from 00 to FF, so #1A73E8 is red 26, green 115, blue 232.' },
  { title: 'CMYK', text: 'K = 1 − max(R, G, B) ÷ 255, then C = (1 − R ÷ 255 − K) ÷ (1 − K), and the same for M and Y.' },
  { title: 'Contrast', text: 'Contrast ratio = (lighter luminance + 0.05) ÷ (darker luminance + 0.05), from the WCAG accessibility guidelines.' },
];

export const examples = [
  { title: 'Google blue', text: '#1A73E8 is rgb(26, 115, 232), hsl(214, 82%, 51%) and cmyk(89%, 50%, 0%, 9%).' },
  { title: 'Short HEX', text: '#FFF is the same as #FFFFFF, pure white.' },
  { title: 'Readable text', text: 'Black text on white has a contrast of 21 : 1. Body text needs at least 4.5 : 1 to pass WCAG AA.' },
];

export const faqs = [
  {
    question: 'Why does a colour change slightly when I convert it back?',
    answer: 'HSL, HSV and CMYK are rounded to whole numbers, so converting back to RGB can move a channel by one or two steps.',
  },
  {
    question: 'Will the CMYK values print exactly?',
    answer: 'No. This is a simple conversion. Real printed colour depends on the printer, ink and paper, so use your printer’s colour profile for exact matches.',
  },
  {
    question: 'What do AA and AAA mean?',
    answer: 'They are WCAG accessibility levels. AA needs a contrast of 4.5 : 1 for normal text and AAA needs 7 : 1. Large text can pass with 3 : 1.',
  },
  {
    question: 'Can I use colour names such as red?',
    answer: 'Not yet. Enter a code instead, for example #FF0000 for red.',
  },
];
