export const howItWorks = [
  { title: 'Choose a PDF', text: 'Pick a file from your device, or drop it on the page.' },
  { title: 'Set a password', text: 'Type it twice, and choose whether people may print or copy text once it is open.' },
  { title: 'Download', text: 'Select Protect PDF, then save the locked file. Share the password separately.' },
];

export const formulas = [
  { title: 'Encryption', text: 'The file is encrypted with AES-256, the strongest standard PDF encryption, which current PDF readers support.' },
  { title: 'Printing and copying', text: 'These limits are honoured by most PDF readers, but some software ignores them, so do not rely on them alone.' },
  { title: 'Strong passwords', text: 'Use 10 or more characters, or a few unrelated words. Short passwords can be guessed by trying many combinations.' },
];

export const examples = [
  { title: 'A payslip or statement', text: 'Lock a document with personal details before sending it by email.' },
  { title: 'A signed contract', text: 'Protect a contract and send the password by phone or text message.' },
  { title: 'Read-only sharing', text: 'Turn off copying so the text cannot easily be pasted elsewhere.' },
];

export const faqs = [
  {
    question: 'Is my file or password uploaded?',
    answer: 'No. The file is encrypted in your browser. Neither the file nor the password leaves your device, and the password is not saved.',
  },
  {
    question: 'What if I forget the password?',
    answer: 'It cannot be recovered, by us or anyone else. Keep a copy of the original file, or store the password safely.',
  },
  {
    question: 'Can I change the password later?',
    answer: 'Yes. Remove it with Unlock PDF, using the current password, then protect the file again.',
  },
  {
    question: 'Can I protect a PDF that already has a password?',
    answer: 'Remove the old password first with Unlock PDF, then set a new one here.',
  },
];
