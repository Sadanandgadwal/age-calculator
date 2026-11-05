export const howItWorks = [
  { title: 'Choose an action', text: 'Select Encode to escape special characters, or Decode to turn entities back into characters.' },
  { title: 'Add your text', text: 'The result updates as you type.' },
  { title: 'Copy the result', text: 'Paste encoded text into your HTML, and it shows as text instead of being read as code.' },
];

export const formulas = [
  { title: 'Essential characters', text: '& becomes &amp;, < becomes &lt;, > becomes &gt;, " becomes &quot; and \' becomes &#39;.' },
  { title: 'Non-English characters', text: 'With the option on, every other non-ASCII character becomes a numeric entity, such as é as &#233;.' },
  { title: 'Decoding', text: 'Reads named entities such as &copy;, decimal such as &#169; and hex such as &#xA9;.' },
];

export const examples = [
  { title: 'Showing code on a page', text: '<b>Hi</b> becomes &lt;b&gt;Hi&lt;/b&gt;, which displays as the tags themselves.' },
  { title: 'An ampersand', text: 'Tom & Jerry becomes Tom &amp; Jerry.' },
  { title: 'Decoding', text: '&copy; 2026 &ndash; All rights decodes to © 2026 – All rights.' },
];

export const faqs = [
  {
    question: 'Is encoding enough to stop script attacks?',
    answer: 'It protects text placed between tags or in quoted attributes. Other places, such as inside scripts or URLs, need different handling, so use your framework’s built-in escaping.',
  },
  {
    question: 'Will decoding run any HTML I paste?',
    answer: 'No. Your text is only ever treated as text, so scripts and tags inside it are never run.',
  },
  {
    question: 'Do I need to encode emoji or Hindi?',
    answer: 'Not on pages saved as UTF-8, which is nearly all of them. Use the option only for systems that accept plain ASCII.',
  },
];
