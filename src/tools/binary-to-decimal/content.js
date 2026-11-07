export const howItWorks = [
  { title: 'Enter a binary number', text: 'Type 0s and 1s. Spaces and a 0b prefix are ignored.' },
  { title: 'See the decimal value', text: 'The answer updates as you type, with the working shown digit by digit.' },
  { title: 'Go the other way', text: 'Choose Decimal to binary to see the repeated division by 2.' },
];

export const formulas = [
  { title: 'Binary to decimal', text: 'Multiply each bit by 2 raised to its position, counting from 0 on the right, then add them up.' },
  { title: 'Decimal to binary', text: 'Divide by 2 again and again, then read the remainders from last to first.' },
  { title: 'Bit values', text: 'From the right, the bits are worth 1, 2, 4, 8, 16, 32, 64, 128 and so on.' },
];

export const examples = [
  { title: '1011', text: '1 × 8 + 0 × 4 + 1 × 2 + 1 × 1 = 11' },
  { title: '1111 1111', text: 'Eight 1s make 255, the largest value of one byte.' },
  { title: '25 to binary', text: '25 ÷ 2 leaves remainders 1, 0, 0, 1, 1, so 25 is 11001.' },
];

export const faqs = [
  {
    question: 'How long can the binary number be?',
    answer: 'Up to 1,000 digits, converted exactly. The working is shown for numbers up to 16 bits, or 64 steps of division.',
  },
  {
    question: 'Can I convert negative numbers?',
    answer: 'Yes, with a minus sign in front, such as -101. Computers often store negative numbers differently, using two’s complement, which this tool does not show.',
  },
  {
    question: 'Why do bytes go up to 255?',
    answer: 'A byte has 8 bits. With all of them set to 1, the value is 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.',
  },
];
