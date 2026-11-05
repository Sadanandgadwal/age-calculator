export const howItWorks = [
  { title: 'Choose an action', text: 'Select Encode to make text safe for a web address, or Decode to read percent-encoded text.' },
  { title: 'Choose what it applies to', text: 'Use a single value for a query parameter, or a whole URL to keep characters such as : / ? & in place.' },
  { title: 'Copy the result', text: 'The result updates as you type.' },
];

export const formulas = [
  { title: 'Percent encoding', text: 'A character that is not safe in a URL becomes its UTF-8 bytes, each written as % and two hex digits.' },
  { title: 'A single value', text: 'Encodes everything except letters, digits and - _ . ! ~ * \' ( ). Use this for a value inside a URL.' },
  { title: 'A whole URL', text: 'Also leaves ; , / ? : @ & = + $ # alone, so the structure of the address stays intact.' },
];

export const examples = [
  { title: 'A search term', text: '“cats & dogs” becomes cats%20%26%20dogs as a single value.' },
  { title: 'A whole URL', text: 'https://a.com/my page?q=1 becomes https://a.com/my%20page?q=1.' },
  { title: 'Hindi text', text: '“नमस्ते” becomes %E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87.' },
];

export const faqs = [
  {
    question: 'When should I use a single value and when a whole URL?',
    answer: 'Use a single value for anything going inside a URL, such as a search term. Use a whole URL only when the complete address is already correct.',
  },
  {
    question: 'Why do plus signs appear in some URLs?',
    answer: 'Web forms traditionally send spaces as plus signs. Select the option when decoding to turn them back into spaces.',
  },
  {
    question: 'Why am I getting an error when decoding?',
    answer: 'The text has a % that is not followed by two hex digits, or the codes do not form valid UTF-8. A literal percent sign should be written as %25.',
  },
];
