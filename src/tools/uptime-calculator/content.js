export const howItWorks = [
  { title: 'Choose a calculation', text: 'Go from an uptime target to allowed downtime, or from an outage to the uptime it leaves.' },
  { title: 'Enter your value', text: 'Type a percentage such as 99.9, or the minutes of downtime and the period.' },
  { title: 'Use the result', text: 'See the answer instantly, for checking an SLA or planning maintenance.' },
];

export const formulas = [
  { title: 'Allowed downtime', text: 'Period length × (100 − uptime %) ÷ 100.' },
  { title: 'Uptime', text: '(Period length − downtime) ÷ period length × 100.' },
  { title: 'Period lengths', text: 'A year is 365.25 days, a quarter is a quarter of that, and a month is one twelfth, so results are averages.' },
];

export const examples = [
  { title: 'Three nines (99.9%)', text: 'Allows about 43 min 49.8 s of downtime a month, or 8 h 45 min 57.6 s a year.' },
  { title: 'Four nines (99.99%)', text: 'Allows about 4 min 23 s a month, or 52 min 36 s a year.' },
  { title: 'A 30 minute outage', text: 'In an average month, this leaves about 99.93% uptime.' },
];

export const faqs = [
  {
    question: 'What does “three nines” mean?',
    answer: 'It means 99.9% uptime, named for the three nines in the number. Each extra nine allows ten times less downtime.',
  },
  {
    question: 'Why might my provider’s numbers differ?',
    answer: 'Providers define a month differently, often using 30 days or the actual calendar month. Some also leave out planned maintenance. Check your SLA for its exact terms.',
  },
  {
    question: 'Does higher uptime always make sense?',
    answer: 'Not always, as each extra nine costs far more to achieve. Choose the level your users really need.',
  },
];
