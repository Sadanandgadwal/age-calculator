export const howItWorks = [
  { title: 'Enter each score', text: 'Add every test, assignment or exam with its score and how much it counts towards the final grade.' },
  { title: 'Add a target', text: 'Optionally enter the overall score you want, to see what you need on the work that is left.' },
  { title: 'Check the scale', text: 'Open Grading scale to choose letter grades, divisions or pass and fail, or set your own.' },
];

export const formulas = [
  { title: 'Weighted score', text: 'Weighted score = Σ(score × weight) ÷ Σ weights' },
  { title: 'Score needed', text: 'Needed = (target × 100 − Σ(score × weight)) ÷ remaining weight' },
  { title: 'Grade', text: 'The grade is the highest one whose minimum percentage your score reaches.' },
];

export const examples = [
  { title: 'A finished course', text: 'Tests 90% worth 50% and a project 80% worth 50% give 85%, an A on the default scale.' },
  { title: 'Before the final exam', text: 'Quizzes 80% worth 20% and a midterm 70% worth 30% give 74% so far.' },
  { title: 'Score needed', text: 'With 74% on half the course, you need 76% on the remaining 50% to finish with 75%.' },
];

export const faqs = [
  {
    question: 'What if my weights do not add up to 100%?',
    answer: 'If they add up to less, the result is your score on the work done so far. If they add up to more, each weight is scaled so the total counts as 100%.',
  },
  {
    question: 'Can I use marks instead of percentages?',
    answer: 'Turn each mark into a percentage first, for example 18 out of 25 is 72%. The Marks Percentage Calculator can help.',
  },
  {
    question: 'My school uses different grade boundaries. Can I change them?',
    answer: 'Yes. Open Grading scale below the calculator and edit the grades and their minimum percentages, or add and remove grades.',
  },
  {
    question: 'How are results rounded?',
    answer: 'Scores are shown to two decimal places. Your school may round differently, so a result just under a boundary could be graded either way.',
  },
];
