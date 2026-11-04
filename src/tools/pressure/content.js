import { EXAMPLE_PAIRS, PRESSURE_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a pressure', text: 'Type the pressure you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from PSI, bar, pascal, kilopascal and standard atmosphere.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Bar to pascal', text: 'Pascal = bar × 1,00,000' },
  { title: 'Atmosphere to pascal', text: 'Pascal = atm × 1,01,325' },
  { title: 'PSI to pascal', text: 'Pascal = psi × 6,894.757293' },
];

export const examples = buildExamples(PRESSURE_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What is the difference between bar and atmosphere?',
    answer: 'They are close but not equal. One bar is exactly 1,00,000 pascals, while one standard atmosphere is exactly 1,01,325 pascals, or 1.01325 bar.',
  },
  {
    question: 'How do I convert PSI to bar?',
    answer: 'Divide by about 14.5038, because one bar is about 14.5038 PSI. For example, 32 PSI is about 2.206 bar.',
  },
  {
    question: 'Is tyre pressure absolute pressure?',
    answer: 'No. Tyre gauges usually show pressure above the surrounding air, called gauge pressure. Converting units does not change this, so a reading stays gauge pressure.',
  },
  {
    question: 'Can I enter a negative pressure?',
    answer: 'No. This converter handles pressure values of 0 or more. Gauge readings below atmospheric pressure are outside what it covers.',
  },
];
