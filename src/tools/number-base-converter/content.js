export const howItWorks = [
  { title: 'Enter a number', text: 'Type a whole number. Spaces, underscores and prefixes such as 0b and 0x are ignored.' },
  { title: 'Choose the bases', text: 'Pick any base from 2 to 36 to convert from and to.' },
  { title: 'Read every form', text: 'The answer updates as you type, with binary, octal, decimal and hexadecimal shown together.' },
];

export const formulas = [
  { title: 'To decimal', text: 'Multiply each digit by the base raised to its position, counting from 0 on the right, and add them up.' },
  { title: 'From decimal', text: 'Divide by the new base again and again, and read the remainders from last to first.' },
  { title: 'Digits above 9', text: 'Letters stand for digits from 10 upwards: A = 10, B = 11, up to Z = 35.' },
];

export const examples = [
  { title: 'Decimal to binary', text: '255 in decimal is 1111 1111 in binary.' },
  { title: 'Hexadecimal to decimal', text: 'FF in hexadecimal is 15 × 16 + 15 = 255.' },
  { title: 'Base 36', text: 'ZZ in base 36 is 35 × 36 + 35 = 1,295.' },
];

export const faqs = [
  {
    question: 'How large can the number be?',
    answer: 'Up to 1,000 digits. Large numbers are converted exactly, without rounding.',
  },
  {
    question: 'Can I convert fractions or decimals such as 10.5?',
    answer: 'No. This converter works with whole numbers, which can be negative.',
  },
  {
    question: 'Does the case of letters matter?',
    answer: 'No. ff and FF are the same. Answers use capital letters.',
  },
  {
    question: 'Why are the digits grouped?',
    answer: 'Binary and hexadecimal are shown in groups of four, and octal and decimal in groups of three, to make long numbers easier to read. Copy the main answer to get it without spaces.',
  },
];
