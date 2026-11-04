import { EXAMPLE_PAIRS, TIME_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter an amount', text: 'Type the amount of time you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick from seconds, minutes, hours, days, weeks and years.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Fixed units', text: '1 minute = 60 seconds, 1 hour = 60 minutes, 1 day = 24 hours, 1 week = 7 days' },
  { title: 'Years', text: '1 year = 365.25 days = 3,15,57,600 seconds' },
  { title: 'Converting', text: 'Result = value × seconds in the first unit ÷ seconds in the second unit' },
];

export const examples = buildExamples(TIME_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'Why is a year 365.25 days here?',
    answer: 'Calendar years vary between 365 and 366 days, so conversions need a fixed length. This converter uses the Julian year of exactly 365.25 days, a standard convention that averages in leap years.',
  },
  {
    question: 'Why are months not included?',
    answer: 'Months range from 28 to 31 days, so they have no single exact length. For calendar dates, use the Date Calculator, which uses real month lengths.',
  },
  {
    question: 'Will this match a calendar exactly?',
    answer: 'Not for years. Over a specific period, the real number of days depends on which leap years it includes, so use the Date Calculator for exact dates.',
  },
  {
    question: 'Can I enter a negative time?',
    answer: 'No. This converter treats time as a length of time, which cannot be negative. To subtract times, use the Time Calculator.',
  },
];
