import { EXAMPLE_PAIRS, FREQUENCY_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a frequency', text: 'Type the frequency you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from hertz, kilohertz, megahertz and gigahertz.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Kilohertz to hertz', text: 'Hertz = kilohertz × 1,000' },
  { title: 'Megahertz to kilohertz', text: 'Kilohertz = megahertz × 1,000' },
  { title: 'Gigahertz to megahertz', text: 'Megahertz = gigahertz × 1,000' },
];

export const examples = buildExamples(FREQUENCY_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What does a hertz measure?',
    answer: 'One hertz is one cycle per second. So 1 kHz is 1,000 cycles per second, and 1 GHz is 1,000,000,000 cycles per second.',
  },
  {
    question: 'Do frequency units use 1000 or 1024?',
    answer: 'Always 1000. Each step from Hz to kHz, MHz and GHz is exactly a power of 1000.',
  },
  {
    question: 'Where will I see these units?',
    answer: 'Sound is often in Hz or kHz, FM radio in MHz, and Wi-Fi and processor speeds in GHz. For example, 2.4 GHz Wi-Fi is the same as 2,400 MHz.',
  },
  {
    question: 'Can I enter a negative frequency?',
    answer: 'No. This converter treats frequency as a count of cycles per second, so values must be 0 or more.',
  },
];
