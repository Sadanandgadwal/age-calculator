import { ANGLE_UNITS, EXAMPLE_PAIRS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter an angle', text: 'Type the angle you want to convert. Decimal and negative values are accepted.' },
  { title: 'Choose your units', text: 'Pick from degrees, radians and gradians, or swap them with one click.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Degrees to radians', text: 'Radians = degrees × π ÷ 180' },
  { title: 'Radians to degrees', text: 'Degrees = radians × 180 ÷ π' },
  { title: 'Degrees to gradians', text: 'Gradians = degrees × 10 ÷ 9' },
];

export const examples = buildExamples(ANGLE_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What is a radian?',
    answer: 'A radian is the angle made when the arc of a circle is as long as its radius. A full circle is 2π radians, which is 360 degrees.',
  },
  {
    question: 'What is a gradian?',
    answer: 'A gradian divides a right angle into 100 equal parts, so a full circle is 400 gradians. It is also called a gon, and is used in surveying.',
  },
  {
    question: 'Why are radian results approximate?',
    answer: 'Converting between radians and degrees involves π, which has endless decimals. Results are rounded and marked with ≈.',
  },
  {
    question: 'Are negative angles and angles over 360 degrees allowed?',
    answer: 'Yes. Negative angles often mean clockwise rotation. Values are converted as entered and are not wrapped into a single turn, so 720 degrees stays two full turns.',
  },
];
