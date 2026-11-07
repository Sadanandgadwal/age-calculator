export const howItWorks = [
  { title: 'Enter an amount', text: 'Type the amount and choose the two currencies. 39 currencies are available, including the rupee, dollar, euro, pound and dirham.' },
  { title: 'Get the latest rate', text: 'The latest reference rate is loaded from Frankfurter, a free service that publishes central bank rates, and the rate date is shown.' },
  { title: 'Use your own rate', text: 'Enter the rate from your bank or card to see exactly what you will receive. It also works if the rate cannot be loaded.' },
];

export const formulas = [
  { title: 'Conversion', text: 'Converted amount = amount × exchange rate' },
  { title: 'Inverse rate', text: '1 ÷ rate gives the rate in the other direction.' },
  { title: 'Rounding', text: 'Amounts are shown to two decimal places, and rates to six significant digits.' },
];

export const examples = [
  { title: 'Rupees to dollars', text: 'At 1 INR = 0.0106 USD, ₹1,000 is about $10.60.' },
  { title: 'Dirhams to rupees', text: 'At 1 AED = 25.6 INR, 500 AED is ₹12,800.' },
  { title: 'Your bank’s rate', text: 'If your card charges 1 USD = 95 INR, enter that as your own rate to see the real cost.' },
];

export const faqs = [
  {
    question: 'Where do the rates come from?',
    answer: 'From Frankfurter, which publishes reference rates from central banks such as the European Central Bank. Rates are updated once each working day and are not live trading prices.',
  },
  {
    question: 'Why is my bank’s rate different?',
    answer: 'Banks, cards and money changers add a margin to the reference rate, and sometimes a fee. Use your own rate to include it.',
  },
  {
    question: 'Is any of my information sent anywhere?',
    answer: 'Only the two currency codes are sent to Frankfurter to get the rate, and only once you enter an amount. The amount itself never leaves your browser.',
  },
  {
    question: 'What if the rate does not load?',
    answer: 'Check your connection and select Try again, or type a rate yourself.',
  },
];
