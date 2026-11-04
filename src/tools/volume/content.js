import { EXAMPLE_PAIRS, VOLUME_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a volume', text: 'Type the volume you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from litres, millilitres, US gallons, UK gallons, US cups and cubic metres.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'US gallons to litres', text: 'Litres = US gallons × 3.785411784' },
  { title: 'UK gallons to litres', text: 'Litres = UK gallons × 4.54609' },
  { title: 'US cups to millilitres', text: 'Millilitres = US cups × 236.5882365' },
];

export const examples = buildExamples(VOLUME_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What is the difference between a US gallon and a UK gallon?',
    answer: 'A US gallon is exactly 3.785411784 litres, and a UK (imperial) gallon is exactly 4.54609 litres. A UK gallon is about 20% larger.',
  },
  {
    question: 'How big is a cup?',
    answer: 'This converter uses the US customary cup, which is one sixteenth of a US gallon, or about 236.59 mL. Metric cups used in some recipes are 250 mL, so check which one your recipe means.',
  },
  {
    question: 'How many litres are in a cubic metre?',
    answer: 'There are exactly 1,000 litres in 1 cubic metre, and 1,000 millilitres in 1 litre.',
  },
  {
    question: 'Can I use this for cooking?',
    answer: 'Yes, for volume. Converting a volume to a weight, such as cups of flour to grams, depends on the ingredient, so this converter does not do that.',
  },
];
