export const howItWorks = [
  { title: 'Pick your scale', text: 'Choose the 4.0 scale used in the US and many other countries, or the 10-point scale used by most Indian universities.' },
  { title: 'Add your courses', text: 'Choose a grade and enter the credits for each course. Names are optional and blank rows are skipped.' },
  { title: 'Include past terms', text: 'To get a cumulative GPA, enter your previous GPA and the credits it covers.' },
];

export const formulas = [
  { title: 'GPA', text: 'GPA = Σ(grade points × credits) ÷ Σ credits' },
  { title: 'Cumulative GPA', text: 'Cumulative GPA = (previous GPA × previous credits + this term’s grade points) ÷ all credits' },
  { title: '10-point grades', text: 'O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, P = 4 and F = 0, as in the UGC choice-based credit system.' },
];

export const examples = [
  { title: 'One term, 4.0 scale', text: 'A in a 4-credit course and B+ in a 3-credit course: (4 × 4 + 3.3 × 3) ÷ 7 = 25.9 ÷ 7 = 3.70.' },
  { title: 'One semester, 10-point scale', text: 'O in 4 credits, A in 3 credits and B+ in 3 credits: (40 + 24 + 21) ÷ 10 = 8.50 SGPA.' },
  { title: 'Cumulative', text: 'A previous GPA of 3.50 over 30 credits plus 3.70 over 7 credits gives (105 + 25.9) ÷ 37 = 3.54.' },
];

export const faqs = [
  {
    question: 'Is SGPA the same as GPA?',
    answer: 'Yes. SGPA is the GPA for one semester. Enter that semester’s courses on the 10-point scale to get your SGPA, and add previous results to get your CGPA.',
  },
  {
    question: 'My university uses different grade points. What should I do?',
    answer: 'Grade points vary between institutions, especially for A+ and the lowest passing grade. Check your grade card, and pick the grade with the same points.',
  },
  {
    question: 'Do failed courses count?',
    answer: 'On most scales an F counts as 0 points with its full credits, which lowers your GPA. Leave the row out if your institution does not count it.',
  },
  {
    question: 'How is the GPA rounded?',
    answer: 'It is shown to two decimal places. Some institutions cut off extra decimals instead of rounding, so your official figure may differ by 0.01.',
  },
];
