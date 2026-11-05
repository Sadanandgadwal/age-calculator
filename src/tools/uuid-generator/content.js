export const howItWorks = [
  { title: 'Choose a version', text: 'Use version 4 for a fully random ID, or version 7 for IDs that sort by the time they were created.' },
  { title: 'Choose how many', text: 'Create from 1 to 1,000, in uppercase or without hyphens if you need them that way.' },
  { title: 'Generate', text: 'Select Generate for new UUIDs, and copy them into your code or database.' },
];

export const formulas = [
  { title: 'Version 4', text: '122 random bits, with 6 fixed bits marking the version and variant, as set out in RFC 9562.' },
  { title: 'Version 7', text: 'A 48-bit Unix timestamp in milliseconds, followed by 74 random bits. New values sort after older ones.' },
  { title: 'Layout', text: '32 hex digits in the groups 8-4-4-4-12. The first digit of the third group shows the version.' },
];

export const examples = [
  { title: 'A database key', text: 'Version 7 keeps new rows close together in an index, which can make inserts faster.' },
  { title: 'A public ID', text: 'Version 4 reveals nothing about when it was made, which suits public links.' },
  { title: 'Test data', text: 'Create 100 at once and paste them into a test file.' },
];

export const faqs = [
  {
    question: 'Can two UUIDs ever be the same?',
    answer: 'In theory, but the chance is so small that it can be ignored in practice, as there are about 5.3 × 10³⁶ possible version 4 values.',
  },
  {
    question: 'Are these safe to use as passwords or secret tokens?',
    answer: 'They are random, but UUIDs are designed to identify things, not to protect them. Use a Password Generator or a purpose-built token for secrets.',
  },
  {
    question: 'Does version 7 reveal the time?',
    answer: 'Yes. Anyone can read the creation time from it, so use version 4 if that matters.',
  },
  {
    question: 'Are UUIDs and GUIDs the same?',
    answer: 'Yes. GUID is the name Microsoft uses for the same format.',
  },
];
