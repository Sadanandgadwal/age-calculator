export const howItWorks = [
  { title: 'Enter your numbers', text: 'Type or paste them, separated by commas, spaces or new lines. Negative numbers and decimals are fine.' },
  { title: 'Add weights if needed', text: 'For a weighted average, give one weight for each number, in the same order.' },
  { title: 'Calculate', text: 'See the average, median, mode, range, sum and count at once.' },
];

export const formulas = [
  { title: 'Average (mean)', text: 'Average = sum of the numbers ÷ how many numbers there are' },
  { title: 'Median', text: 'The middle number once the list is sorted. With an even count, it is the average of the two middle numbers.' },
  { title: 'Mode', text: 'The number or numbers that appear most often.' },
  { title: 'Weighted average', text: 'Weighted average = Σ(number × weight) ÷ Σ weights' },
];

export const examples = [
  { title: 'Test scores', text: '70, 85, 90 and 75 have a sum of 320, so the average is 320 ÷ 4 = 80.' },
  { title: 'Median and mode', text: 'For 3, 7, 7, 2, 9 the median is 7, the mode is 7 and the range is 9 − 2 = 7.' },
  { title: 'Weighted marks', text: 'Marks of 80 and 60 with weights 3 and 1 give (240 + 60) ÷ 4 = 75.' },
];

export const faqs = [
  {
    question: 'What is the difference between mean, median and mode?',
    answer: 'The mean adds everything up and divides by the count. The median is the middle value, so one very large or small number affects it less. The mode is the most common value.',
  },
  {
    question: 'Can I paste numbers from a spreadsheet?',
    answer: 'Yes. A column copied from a spreadsheet arrives as one number per line, which works directly.',
  },
  {
    question: 'Why is 1,000 read as two numbers?',
    answer: 'Commas separate the numbers in the list, so write large numbers without commas, such as 1000.',
  },
  {
    question: 'When should I use a weighted average?',
    answer: 'When some values count more than others, such as exams worth different percentages of a final grade, or prices bought in different quantities.',
  },
  {
    question: 'How many numbers can I enter?',
    answer: 'Up to 10,000. Results are rounded to two decimal places.',
  },
];
