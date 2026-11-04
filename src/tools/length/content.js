import { EXAMPLE_PAIRS, LENGTH_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a value', text: 'Type the length you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick the units to convert from and to, or swap them with one click.' },
  { title: 'Get the result', text: 'The result updates instantly, and feet results also show a combined feet and inches value.' },
];

export const formulas = [
  { title: 'Centimeters to feet', text: 'Feet = centimeters ÷ 30.48' },
  { title: 'Feet to centimeters', text: 'Centimeters = feet × 30.48' },
  { title: 'Inches to centimeters', text: 'Centimeters = inches × 2.54' },
];

export const examples = buildExamples(LENGTH_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'How do I convert my height from cm to feet and inches?',
    answer: 'Enter your height in centimeters and convert to feet. The result includes a combined value, so 170 cm shows as 5 ft 6.93 in.',
  },
  {
    question: 'How many centimeters are in a foot?',
    answer: 'One foot is exactly 30.48 centimeters, and one inch is exactly 2.54 centimeters.',
  },
  {
    question: 'Are feet and inches here international units?',
    answer: 'Yes. This converter uses the international foot, inch, yard and mile, which are the standard definitions in everyday use.',
  },
  {
    question: 'How are very large or small results shown?',
    answer: 'Results show up to 10 significant digits. Extremely large or small values use scientific notation, such as 1e+15.',
  },
];
