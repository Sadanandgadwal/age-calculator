import { checkNumber } from '../../utils/fieldValidation.js';
import { formatDecimal } from '../../utils/number.js';

export const SCALES = [
  {
    id: 'four',
    name: '4.0 scale',
    max: 4,
    grades: [['A+', 4], ['A', 4], ['A−', 3.7], ['B+', 3.3], ['B', 3], ['B−', 2.7], ['C+', 2.3], ['C', 2], ['C−', 1.7], ['D+', 1.3], ['D', 1], ['D−', 0.7], ['F', 0]],
  },
  {
    id: 'ten',
    name: '10-point scale',
    max: 10,
    grades: [['O', 10], ['A+', 9], ['A', 8], ['B+', 7], ['B', 6], ['C', 5], ['P', 4], ['F', 0]],
  },
];

export const getScale = (id) => SCALES.find((scale) => scale.id === id) ?? SCALES[0];
export const gradePoints = (scale, grade) => scale.grades.find(([name]) => name === grade)?.[1];

const MAX_CREDITS = 30;
const isBlank = ({ name, grade, credits }) => !String(name ?? '').trim() && !grade && !String(credits ?? '').trim();

const creditsField = (text) =>
  checkNumber(text, { required: 'Please enter the credits.', aboveMin: true, max: MAX_CREDITS, minMessage: 'Credits must be greater than 0.', maxMessage: `Credits must be ${MAX_CREDITS} or less.` });

export function evaluate(scaleId, courses, previous) {
  const scale = getScale(scaleId);
  const errors = {};
  const counted = [];
  courses.forEach((course, index) => {
    if (isBlank(course)) return;
    const rowErrors = {};
    if (gradePoints(scale, course.grade) === undefined) rowErrors.grade = 'Please choose a grade.';
    const credits = creditsField(course.credits);
    if (credits.error) rowErrors.credits = credits.error;
    if (Object.keys(rowErrors).length) errors[course.id] = rowErrors;
    else counted.push({ name: String(course.name ?? '').trim() || `Course ${index + 1}`, grade: course.grade, points: gradePoints(scale, course.grade), credits: credits.value });
  });
  if (counted.length === 0 && Object.keys(errors).length === 0) {
    errors[courses[0].id] = { grade: 'Please add at least one course with a grade and credits.' };
  }

  let prior = null;
  const hasGpa = String(previous.gpa ?? '').trim();
  const hasCredits = String(previous.credits ?? '').trim();
  if (hasGpa || hasCredits) {
    const gpaField = checkNumber(previous.gpa, { required: 'Please enter your previous GPA, or clear both previous fields.', max: scale.max, maxMessage: `The GPA must be between 0 and ${scale.max}.`, minMessage: `The GPA must be between 0 and ${scale.max}.` });
    const priorCredits = checkNumber(previous.credits, { required: 'Please enter your previous credits, or clear both previous fields.', aboveMin: true, max: 10000, minMessage: 'Credits must be greater than 0.', maxMessage: 'Please enter 10,000 credits or fewer.' });
    if (gpaField.error) errors.previousGpa = gpaField.error;
    if (priorCredits.error) errors.previousCredits = priorCredits.error;
    if (!gpaField.error && !priorCredits.error) prior = { gpa: gpaField.value, credits: priorCredits.value };
  }
  if (Object.keys(errors).length) return { errors };

  const totalCredits = counted.reduce((total, course) => total + course.credits, 0);
  const totalPoints = counted.reduce((total, course) => total + course.credits * course.points, 0);
  const gpa = totalPoints / totalCredits;
  const cumulative = prior ? (prior.gpa * prior.credits + totalPoints) / (prior.credits + totalCredits) : null;
  return { errors, result: { scale, courses: counted, totalCredits, totalPoints, gpa, prior, cumulative } };
}

export const formatGpa = (value) => value.toFixed(2);

export function buildResultText({ scale, courses, totalCredits, gpa, cumulative }) {
  return [
    `GPA: ${formatGpa(gpa)} out of ${scale.max}`,
    ...(cumulative !== null ? [`Cumulative GPA: ${formatGpa(cumulative)}`] : []),
    `Total credits: ${formatDecimal(totalCredits)}`,
    ...courses.map(({ name, grade, credits }) => `${name}: ${grade}, ${formatDecimal(credits)} credits`),
  ].join('\n');
}

export function buildReport({ scale, courses, totalCredits, totalPoints, gpa, prior, cumulative }) {
  return {
    subtitle: scale.name,
    inputs: [
      ...courses.map(({ name, grade, points, credits }, index) => ({ label: `${index + 1}. ${name}`, value: `${grade} (${formatDecimal(points)} points), ${formatDecimal(credits)} credits` })),
      ...(prior ? [{ label: 'Previous GPA', value: `${formatGpa(prior.gpa)} over ${formatDecimal(prior.credits)} credits` }] : []),
    ],
    results: [{ label: 'GPA', value: `${formatGpa(gpa)} out of ${scale.max}` }, ...(cumulative !== null ? [{ label: 'Cumulative GPA', value: formatGpa(cumulative) }] : [])],
    details: [
      { label: 'Total credits', value: formatDecimal(totalCredits) },
      { label: 'Total grade points', value: formatDecimal(totalPoints) },
    ],
    formula: 'GPA = Σ(grade points × credits) ÷ Σ credits',
  };
}
