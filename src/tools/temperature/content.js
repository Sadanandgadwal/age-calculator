export const howItWorks = [
  { title: 'Enter a temperature', text: 'Type any temperature. Decimals and negative values are accepted, down to absolute zero.' },
  { title: 'Choose your units', text: 'Pick Celsius, Fahrenheit or Kelvin to convert from and to, or swap them with one click.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the exact formula used.' },
];

export const formulas = [
  { title: 'Celsius to Fahrenheit', text: '°F = (°C × 9/5) + 32' },
  { title: 'Fahrenheit to Celsius', text: '°C = (°F − 32) × 5/9' },
  { title: 'Celsius to Kelvin', text: 'K = °C + 273.15' },
];

export const examples = [
  { title: 'Freezing point of water', text: '0 °C = 32 °F = 273.15 K' },
  { title: 'Boiling point of water', text: '100 °C = 212 °F = 373.15 K' },
  { title: 'Normal body temperature', text: '37 °C = 98.6 °F = 310.15 K' },
  { title: 'Where the scales meet', text: '−40 °C = −40 °F' },
  { title: 'Absolute zero', text: '0 K = −273.15 °C = −459.67 °F' },
  { title: 'A warm day', text: '30 °C = 86 °F = 303.15 K' },
];

export const faqs = [
  {
    question: 'Why is there no simple multiplier for temperature?',
    answer: 'Celsius and Fahrenheit have different zero points as well as different step sizes, so conversions need an addition or subtraction as well as a multiplication.',
  },
  {
    question: 'Why can I not enter a very low temperature?',
    answer: 'Absolute zero, which is 0 K or −273.15 °C, is the lowest possible temperature. Values below it are not physically meaningful, so they are rejected.',
  },
  {
    question: 'Is it "degrees Kelvin"?',
    answer: 'No. Kelvin is written without the degree symbol, so 300 K is read as "300 kelvin".',
  },
  {
    question: 'At what temperature are Celsius and Fahrenheit equal?',
    answer: 'They are equal at −40. So −40 °C is exactly the same temperature as −40 °F.',
  },
];
