import { ceilTo2, formatDecimal, parseDecimal, roundTo2 } from '../../utils/number.js';

export const GRADE_SCALES = {
  standard: {
    name: 'Letter grades',
    grades: [
      ['A+', 90],
      ['A', 80],
      ['B+', 70],
      ['B', 60],
      ['C', 50],
      ['D', 40],
      ['F', 0],
    ],
  },
  division: {
    name: 'Divisions',
    grades: [
      ['Distinction', 75],
      ['First', 60],
      ['Second', 45],
      ['Third', 33],
      ['Fail', 0],
    ],
  },
  passFail: {
    name: 'Pass or fail',
    grades: [
      ['Pass', 33],
      ['Fail', 0],
    ],
  },
};

export const scaleRows = (scaleId) =>
  GRADE_SCALES[scaleId].grades.map(([label, min], index) => ({ id: `${scaleId}-${index}`, label, min: String(min) }));

export const percentOf = (part, whole) => roundTo2((part / whole) * 100);

function numberError(text, requiredMessage) {
  if (!String(text ?? '').trim()) return { error: requiredMessage };
  const value = parseDecimal(text);
  if (value === null) return { error: 'Please enter a valid number.' };
  return { value };
}

export function validateMarks(obtainedText, maxText) {
  const errors = {};
  const max = numberError(maxText, 'Please enter the maximum marks.');
  const obtained = numberError(obtainedText, 'Please enter the obtained marks.');

  if (max.error) errors.max = max.error;
  else if (max.value <= 0) errors.max = 'Maximum marks must be greater than zero.';

  if (obtained.error) errors.obtained = obtained.error;
  else if (obtained.value < 0) errors.obtained = 'Marks cannot be negative.';
  else if (!errors.max && obtained.value > max.value) errors.obtained = 'Obtained marks cannot exceed maximum marks.';

  return errors;
}

export function validateSubjects(subjects) {
  const errors = {};
  for (const { id, name, max, obtained } of subjects) {
    const rowErrors = validateMarks(obtained, max);
    if (!name.trim()) rowErrors.name = 'Please enter a subject name.';
    if (Object.keys(rowErrors).length > 0) errors[id] = rowErrors;
  }
  return errors;
}

export function validateScale(rows) {
  const errors = {};
  const seen = new Set();
  let hasZero = false;

  for (const { id, label, min } of rows) {
    const rowErrors = {};
    const value = parseDecimal(min);
    if (!label.trim()) rowErrors.label = 'Please enter a grade name.';
    if (value === null) rowErrors.min = 'Please enter a percentage.';
    else if (value < 0 || value > 100) rowErrors.min = 'Must be between 0 and 100.';
    else if (seen.has(value)) rowErrors.min = 'Each grade needs a different minimum.';
    else {
      seen.add(value);
      if (value === 0) hasZero = true;
    }
    if (Object.keys(rowErrors).length > 0) errors[id] = rowErrors;
  }

  return { rowErrors: errors, missingZero: !hasZero, isValid: hasZero && Object.keys(errors).length === 0 };
}

export function getGrade(percent, rows) {
  const scale = rows
    .map(({ label, min }) => ({ label: label.trim(), min: parseDecimal(min) }))
    .sort((a, b) => b.min - a.min);
  return scale.find(({ min }) => percent >= min)?.label ?? null;
}

export function calculateOverall(obtainedText, maxText) {
  const obtained = parseDecimal(obtainedText);
  const max = parseDecimal(maxText);
  return { obtained, max, remaining: roundTo2(max - obtained), percent: percentOf(obtained, max) };
}

const joinNames = (rows) => rows.map(({ name }) => name).join(', ');

export function calculateSubjects(subjects) {
  const rows = subjects.map(({ id, name, max, obtained }) => {
    const obtainedValue = parseDecimal(obtained);
    const maxValue = parseDecimal(max);
    return { id, name: name.trim(), obtained: obtainedValue, max: maxValue, percent: percentOf(obtainedValue, maxValue) };
  });
  const obtained = roundTo2(rows.reduce((sum, row) => sum + row.obtained, 0));
  const max = roundTo2(rows.reduce((sum, row) => sum + row.max, 0));
  const scores = rows.map(({ obtained: value, max: rowMax }) => value / rowMax);
  const best = Math.max(...scores);
  const worst = Math.min(...scores);

  return {
    rows,
    obtained,
    max,
    percent: percentOf(obtained, max),
    average: roundTo2(obtained / rows.length),
    highest: joinNames(rows.filter((_, index) => scores[index] === best)),
    lowest: joinNames(rows.filter((_, index) => scores[index] === worst)),
  };
}

export function validateTarget({ target, obtained, maxSoFar, remaining }) {
  const errors = {};
  const targetValue = numberError(target, 'Please enter your target percentage.');
  const obtainedValue = numberError(obtained, 'Please enter your marks so far. Use 0 if you have none.');
  const maxValue = numberError(maxSoFar, 'Please enter the maximum marks so far. Use 0 if you have none.');
  const remainingValue = numberError(remaining, 'Please enter the maximum marks remaining.');

  if (targetValue.error) errors.target = targetValue.error;
  else if (targetValue.value < 0 || targetValue.value > 100) errors.target = 'Target must be between 0 and 100.';

  if (maxValue.error) errors.maxSoFar = maxValue.error;
  else if (maxValue.value < 0) errors.maxSoFar = 'Marks cannot be negative.';

  if (remainingValue.error) errors.remaining = remainingValue.error;
  else if (remainingValue.value < 0) errors.remaining = 'Marks cannot be negative.';
  else if (!errors.maxSoFar && remainingValue.value + maxValue.value <= 0) {
    errors.remaining = 'Total maximum marks must be greater than zero.';
  }

  if (obtainedValue.error) errors.obtained = obtainedValue.error;
  else if (obtainedValue.value < 0) errors.obtained = 'Marks cannot be negative.';
  else if (!errors.maxSoFar && obtainedValue.value > maxValue.value) {
    errors.obtained = 'Obtained marks cannot exceed maximum marks.';
  }

  return errors;
}

export function calculateTarget({ target, obtained, maxSoFar, remaining }) {
  const targetValue = parseDecimal(target);
  const obtainedValue = parseDecimal(obtained);
  const remainingValue = parseDecimal(remaining);
  const totalMax = parseDecimal(maxSoFar) + remainingValue;
  const requiredTotal = ceilTo2((targetValue / 100) * totalMax);
  const needed = Math.max(0, roundTo2(requiredTotal - obtainedValue));

  let status = 'possible';
  if (needed === 0) status = 'achieved';
  else if (needed > remainingValue) status = 'impossible';

  return {
    status,
    needed,
    requiredTotal,
    totalMax,
    remaining: remainingValue,
    neededPercent: remainingValue > 0 ? percentOf(needed, remainingValue) : 0,
    maxPossiblePercent: percentOf(obtainedValue + remainingValue, totalMax),
  };
}

const marks = (obtained, max) => `${formatDecimal(obtained)} / ${formatDecimal(max)}`;

export function buildSubjectsText(result, grade) {
  return [
    `Total: ${marks(result.obtained, result.max)}`,
    `Percentage: ${formatDecimal(result.percent)}%`,
    grade && `Grade: ${grade}`,
    `Average marks: ${formatDecimal(result.average)}`,
    `Highest: ${result.highest}`,
    `Lowest: ${result.lowest}`,
    ...result.rows.map(({ name, obtained, max, percent }) => `${name}: ${marks(obtained, max)} (${formatDecimal(percent)}%)`),
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildOverallText(result, grade) {
  return [
    `Total: ${marks(result.obtained, result.max)}`,
    `Percentage: ${formatDecimal(result.percent)}%`,
    grade && `Grade: ${grade}`,
    `Marks lost: ${formatDecimal(result.remaining)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildTargetText(result, target) {
  return [
    `Target: ${formatDecimal(parseDecimal(target))}%`,
    `Marks needed: ${formatDecimal(result.needed)} of ${formatDecimal(result.remaining)} remaining`,
    `Best possible percentage: ${formatDecimal(result.maxPossiblePercent)}%`,
  ].join('\n');
}
