export const howItWorks = [
  {
    title: 'Subject-wise marks',
    text: 'Enter each subject with its maximum and obtained marks. Add or remove subjects as needed, then calculate your totals.',
  },
  {
    title: 'Overall marks',
    text: 'If you already know your total, enter your obtained and maximum marks to get your percentage and grade.',
  },
  {
    title: 'Target marks',
    text: 'Enter your target percentage, your marks so far and the marks still available to see what you need.',
  },
];

export const formulas = [
  { title: 'Percentage', text: 'Percentage = (obtained marks ÷ maximum marks) × 100' },
  { title: 'Average marks', text: 'Average = total obtained marks ÷ number of subjects' },
  { title: 'Marks needed', text: 'Marks needed = (target % ÷ 100 × total maximum marks) − marks so far' },
];

export const examples = [
  { title: 'Percentage', text: '450 out of 500 marks is (450 ÷ 500) × 100 = 90%.' },
  { title: 'Average', text: 'Scores of 80, 70 and 90 total 240, so the average is 240 ÷ 3 = 80 marks.' },
  {
    title: 'Target',
    text: 'For 75% of 500 marks you need 375. With 200 marks so far, you need 175 from the remaining marks.',
  },
];

export const faqs = [
  {
    question: 'How are the highest and lowest subjects decided?',
    answer:
      'Subjects are compared by percentage, not raw marks, so subjects with different maximum marks are compared fairly. Tied subjects are all shown.',
  },
  {
    question: 'Which grading scale should I use?',
    answer:
      'Grading rules differ between boards and institutions. The included scales are examples, so edit the grades and minimum percentages to match your own rules.',
  },
  {
    question: 'Is the overall percentage the average of subject percentages?',
    answer:
      'Not always. This calculator divides total obtained marks by total maximum marks, so a subject with more marks counts for more.',
  },
  {
    question: 'Are my marks saved or shared?',
    answer: 'No. The calculation runs entirely in your browser, and your marks are not sent to a server or stored.',
  },
];
