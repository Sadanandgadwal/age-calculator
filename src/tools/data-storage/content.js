import { EXAMPLE_PAIRS, STORAGE_UNITS } from './logic.js';
import { buildExamples } from '../../utils/unitConversion.js';

export const howItWorks = [
  { title: 'Enter a size', text: 'Type the amount of data you want to convert. Decimal values are accepted.' },
  { title: 'Choose your units', text: 'Pick decimal units such as GB, which are 1000-based, or binary units such as GiB, which are 1024-based.' },
  { title: 'Get the result', text: 'The result updates as you type, along with the formula and conversion rate.' },
];

export const formulas = [
  { title: 'Decimal units', text: '1 KB = 1,000 B, 1 MB = 1,000 KB, 1 GB = 1,000 MB, 1 TB = 1,000 GB, 1 PB = 1,000 TB' },
  { title: 'Binary units', text: '1 KiB = 1,024 B, 1 MiB = 1,024 KiB, 1 GiB = 1,024 MiB, 1 TiB = 1,024 GiB, 1 PiB = 1,024 TiB' },
  { title: 'Between the two', text: 'Convert through bytes. For example, GiB = GB × 1,000,000,000 ÷ 1,073,741,824.' },
];

export const examples = buildExamples(STORAGE_UNITS, EXAMPLE_PAIRS);

export const faqs = [
  {
    question: 'What is the difference between GB and GiB?',
    answer: 'A gigabyte (GB) is exactly 1,000,000,000 bytes, while a gibibyte (GiB) is exactly 1,073,741,824 bytes. A GiB is about 7.4% larger.',
  },
  {
    question: 'Why does my 500 GB drive show less space on my computer?',
    answer: 'Drive makers use decimal gigabytes, while some operating systems count in binary units but label them GB. So 500 GB appears as about 465.66 in those systems.',
  },
  {
    question: 'Is 1 KB 1,000 or 1,024 bytes?',
    answer: 'By the international standard, 1 KB is 1,000 bytes and 1 KiB is 1,024 bytes. Some software still uses KB to mean 1,024 bytes, so check what your software means.',
  },
  {
    question: 'Does this convert bits, such as internet speeds?',
    answer: 'No. These units are all based on bytes. Internet speeds are usually in bits, and one byte is 8 bits.',
  },
];
