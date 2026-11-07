export const howItWorks = [
  { title: 'Enter a decimal number', text: 'Type a whole number, such as 255 or 4096.' },
  { title: 'See the hex value', text: 'The answer updates as you type, with the repeated division by 16 shown as a table.' },
  { title: 'Go the other way', text: 'Choose Hex to decimal to turn values such as FF or 0x1A3 back into decimal.' },
];

export const formulas = [
  { title: 'Decimal to hex', text: 'Divide by 16 again and again, then read the remainders from last to first. Remainders 10 to 15 are written A to F.' },
  { title: 'Hex to decimal', text: 'Multiply each digit by 16 raised to its position, counting from 0 on the right, then add them up.' },
  { title: 'Hex digits', text: '0 to 9, then A = 10, B = 11, C = 12, D = 13, E = 14 and F = 15.' },
];

export const examples = [
  { title: '255', text: '255 ÷ 16 = 15 remainder 15, and 15 ÷ 16 = 0 remainder 15, so 255 is FF.' },
  { title: '4096', text: '4096 is 1000 in hex, because 16³ = 4096.' },
  { title: 'Colour codes', text: 'The colour #1A73E8 has red 1A = 26, green 73 = 115 and blue E8 = 232.' },
];

export const faqs = [
  {
    question: 'Where is hexadecimal used?',
    answer: 'In colour codes, memory addresses, error codes and file data. Two hex digits describe one byte exactly.',
  },
  {
    question: 'Should I type 0x before a hex number?',
    answer: 'It is optional. 0xFF and FF give the same answer.',
  },
  {
    question: 'How large can the number be?',
    answer: 'Up to 1,000 digits, converted exactly. The working is shown for up to 64 steps of division.',
  },
];
