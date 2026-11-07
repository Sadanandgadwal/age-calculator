export const howItWorks = [
  { title: 'Choose a protected PDF', text: 'Pick a file that asks for a password, or that limits printing or copying.' },
  { title: 'Enter its password', text: 'Type the password you already have for the file.' },
  { title: 'Download', text: 'Save a copy that opens without a password and has no limits.' },
];

export const formulas = [
  { title: 'What it removes', text: 'The password needed to open the file, and any limits on printing, copying or editing.' },
  { title: 'Which password works', text: 'The password to open the file, or the owner password that sets the limits.' },
  { title: 'What it never does', text: 'It does not guess, crack or skip passwords. Without the right password, nothing is changed.' },
];

export const examples = [
  { title: 'A bank statement', text: 'Remove the password from your own statement so it opens without typing it each time.' },
  { title: 'Merging protected files', text: 'Unlock files with their passwords first, then combine them with Merge PDF.' },
  { title: 'Printing limits', text: 'Remove the print limit from a document you have the owner password for.' },
];

export const faqs = [
  {
    question: 'Is my file or password uploaded?',
    answer: 'No. The file is unlocked in your browser. Neither the file nor the password leaves your device, and the password is not saved.',
  },
  {
    question: 'I forgot the password. Can you unlock it?',
    answer: 'No. This tool only works with a password you already have, and does not try to guess it.',
  },
  {
    question: 'Is it legal to unlock a PDF?',
    answer: 'Only unlock files you own or have permission to change. Having a password does not always give permission to remove it.',
  },
  {
    question: 'Is my original file changed?',
    answer: 'No. A new, unlocked copy is created, and the original stays protected.',
  },
];
