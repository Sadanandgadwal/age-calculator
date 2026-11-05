export const howItWorks = [
  { title: 'Choose a length', text: 'Pick from 4 to 128 characters. Longer passwords are stronger.' },
  { title: 'Choose your characters', text: 'Mix letters, numbers and symbols, and skip characters that look alike if you will type it by hand.' },
  { title: 'Generate and copy', text: 'Select Generate, copy the password, and save it in a password manager.' },
];

export const formulas = [
  { title: 'Bits of randomness', text: 'Length × log₂(number of possible characters). Each extra bit doubles the number of possible passwords.' },
  { title: 'Strength', text: 'Under 40 bits is weak, 40 to 59 is fair, 60 to 79 is strong, and 80 or more is very strong.' },
  { title: 'Every type included', text: 'The password always has at least one character of each type you selected.' },
];

export const examples = [
  { title: '16 characters, all types', text: 'About 103 bits of randomness, which is very strong.' },
  { title: '8 lowercase letters', text: 'About 38 bits, which is weak.' },
  { title: '12 letters and numbers', text: 'About 71 bits, which is strong.' },
];

export const faqs = [
  {
    question: 'Is my password sent or saved anywhere?',
    answer: 'No. It is created in your browser and never leaves it, and it is gone when you leave the page or select Generate again.',
  },
  {
    question: 'Why can’t I share or print the password?',
    answer: 'A password should not pass through other apps or sit on paper. Copy it straight into a password manager instead.',
  },
  {
    question: 'How is the randomness created?',
    answer: 'It comes from your browser’s cryptographic random generator, which is designed for security work. Ordinary random functions are not.',
  },
  {
    question: 'Does the strength rating guarantee safety?',
    answer: 'It is an estimate based on length and character types. Also use a different password for each account, and turn on two-step sign-in where you can.',
  },
];
