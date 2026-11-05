import { AREA_UNITS, EXAMPLE_PAIRS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter an area', text: 'Type the area you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from square feet, square metres, acres, hectares, cents and square yards.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Acres to square feet', text: 'Square feet = acres × 43,560' },
  { title: 'Cents to square feet', text: 'Square feet = cents × 435.6' },
  { title: 'Hectares to square metres', text: 'Square metres = hectares × 10,000' },
];

export const examples = buildExamples(AREA_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What is a cent in land measurement?',
    answer: 'A cent is one hundredth of an acre, which is exactly 435.6 square feet. It is commonly used for land in South India.',
  },
  {
    question: 'How many square feet are in an acre?',
    answer: 'One acre is exactly 43,560 square feet, which is the same as 100 cents or about 4,046.86 square metres.',
  },
  {
    question: 'What is the difference between an acre and a hectare?',
    answer: 'A hectare is larger. One hectare is exactly 10,000 square metres, or about 2.47105 acres.',
  },
  {
    question: 'Do local land measures vary?',
    answer: 'Some traditional land units differ by region. The units here use their standard definitions, so check local records for legal or property matters.',
  },
];
