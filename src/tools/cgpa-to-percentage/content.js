export const howItWorks = [
  { title: 'Enter your CGPA', text: 'Type the CGPA from your grade card, on a 10-point scale.' },
  { title: 'Choose the formula', text: 'Pick your board or university, or enter the multiplier it uses.' },
  { title: 'Get the percentage', text: 'See the equivalent percentage and the exact formula used, ready to copy or print.' },
];

export const formulas = [
  { title: 'CBSE', text: 'Percentage = CGPA × 9.5' },
  { title: 'AICTE', text: 'Percentage = (CGPA − 0.5) × 10' },
  { title: 'VTU', text: 'Percentage = (CGPA − 0.75) × 10' },
  { title: 'Mumbai University', text: 'Percentage = 7.1 × CGPA + 11' },
];

export const examples = [
  { title: 'CBSE', text: 'A CGPA of 8.6 is 8.6 × 9.5 = 81.7%.' },
  { title: 'AICTE', text: 'A CGPA of 7.8 is (7.8 − 0.5) × 10 = 73%.' },
  { title: 'VTU', text: 'A CGPA of 8.25 is (8.25 − 0.75) × 10 = 75%.' },
];

export const faqs = [
  {
    question: 'Which formula should I use?',
    answer: 'Use the one your board or university publishes, usually printed on the back of the grade card. Employers and universities abroad often ask for the official conversion, not an estimate.',
  },
  {
    question: 'Where does the CBSE 9.5 come from?',
    answer: 'CBSE worked it out from the average marks of students who got a 10 CGPA in past years. It is an indicative conversion, not an exact one.',
  },
  {
    question: 'My university is not listed. What can I do?',
    answer: 'Choose Custom multiplier and enter the number your university multiplies the CGPA by. If its formula also adds or subtracts a number, work that out separately.',
  },
  {
    question: 'Why is my result capped at 100% or 0%?',
    answer: 'Some formulas give values above 100 or below 0 at the ends of the scale. The calculator caps the result and says so, as a percentage cannot go outside that range.',
  },
];
