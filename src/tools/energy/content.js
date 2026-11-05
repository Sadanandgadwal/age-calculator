import { ENERGY_UNITS, EXAMPLE_PAIRS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter an amount', text: 'Type the amount of energy you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from joules, calories, kilocalories, kilowatt-hours and BTU.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Calories to joules', text: 'Joules = calories × 4.184' },
  { title: 'Kilowatt-hours to joules', text: 'Joules = kWh × 36,00,000' },
  { title: 'BTU to joules', text: 'Joules = BTU × 1,055.05585262' },
];

export const examples = buildExamples(ENERGY_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What is the difference between a calorie and a kilocalorie?',
    answer: 'One kilocalorie (kcal) is 1,000 calories (cal). Food labels often say "Calories" with a capital C, and that means kilocalories, so a 200 Calorie snack is 200 kcal.',
  },
  {
    question: 'Which calorie does this converter use?',
    answer: 'It uses the thermochemical calorie, defined as exactly 4.184 joules. A slightly different definition, the international table calorie, is 4.1868 joules.',
  },
  {
    question: 'Which BTU does this converter use?',
    answer: 'It uses the international table BTU, defined as exactly 1,055.05585262 joules. Other BTU definitions differ slightly.',
  },
  {
    question: 'How much energy is one unit of electricity?',
    answer: 'One unit on an electricity bill is usually 1 kWh, which is exactly 36,00,000 joules.',
  },
];
