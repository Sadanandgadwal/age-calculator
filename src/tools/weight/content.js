import { EXAMPLE_PAIRS, WEIGHT_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a value', text: 'Type the weight you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick the units to convert from and to, or swap them with one click.' },
  { title: 'Get the result', text: 'The result updates instantly as you type, along with the formula used.' },
];

export const formulas = [
  { title: 'Kilograms to grams', text: 'Grams = kilograms × 1,000' },
  { title: 'Grams to kilograms', text: 'Kilograms = grams ÷ 1,000' },
  { title: 'Pounds to grams', text: 'Grams = pounds × 453.59237' },
];

export const examples = buildExamples(WEIGHT_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'How many grams are in a kilogram?',
    answer: 'There are exactly 1,000 grams in 1 kilogram, so multiply kilograms by 1,000 to get grams.',
  },
  {
    question: 'How many pounds are in a kilogram?',
    answer: 'One kilogram is about 2.20462 pounds. The pound is defined as exactly 453.59237 grams.',
  },
  {
    question: 'Is a metric tonne the same as a ton?',
    answer:
      'Not exactly. A metric tonne is 1,000 kilograms. The US ton and UK ton are different units, and this converter uses the metric tonne.',
  },
  {
    question: 'How are very large or small results shown?',
    answer: 'Results show up to 10 significant digits. Extremely large or small values use scientific notation, such as 1e+15.',
  },
];
