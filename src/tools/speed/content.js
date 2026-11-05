import { EXAMPLE_PAIRS, SPEED_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a speed', text: 'Type the speed you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from kilometres per hour, miles per hour, metres per second and knots.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Miles per hour to km/h', text: 'km/h = mph × 1.609344' },
  { title: 'Metres per second to km/h', text: 'km/h = m/s × 3.6' },
  { title: 'Knots to km/h', text: 'km/h = knots × 1.852' },
];

export const examples = buildExamples(SPEED_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'How do I convert km/h to mph?',
    answer: 'Divide by 1.609344, because one mile is exactly 1.609344 kilometres. For example, 100 km/h is about 62.14 mph.',
  },
  {
    question: 'What is a knot?',
    answer: 'A knot is one nautical mile per hour, which is exactly 1.852 km/h. Knots are used at sea and in aviation.',
  },
  {
    question: 'Why multiply m/s by 3.6?',
    answer: 'There are 3,600 seconds in an hour and 1,000 metres in a kilometre, so 1 m/s is exactly 3,600 ÷ 1,000 = 3.6 km/h.',
  },
  {
    question: 'Can I enter a negative speed?',
    answer: 'No. Speed is a size without direction, so it cannot be negative.',
  },
];
