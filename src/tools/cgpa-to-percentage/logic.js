import { checkNumber, collectFields } from '../../utils/fieldValidation.js';
import { formatDecimal, roundTo2 } from '../../utils/number.js';

export const FORMULAS = [
  { id: 'cbse', name: 'CBSE (CGPA × 9.5)', formula: 'Percentage = CGPA × 9.5', convert: (cgpa) => cgpa * 9.5 },
  { id: 'aicte', name: 'AICTE ((CGPA − 0.5) × 10)', formula: 'Percentage = (CGPA − 0.5) × 10', convert: (cgpa) => (cgpa - 0.5) * 10 },
  { id: 'vtu', name: 'VTU ((CGPA − 0.75) × 10)', formula: 'Percentage = (CGPA − 0.75) × 10', convert: (cgpa) => (cgpa - 0.75) * 10 },
  { id: 'mumbai', name: 'Mumbai University (7.1 × CGPA + 11)', formula: 'Percentage = 7.1 × CGPA + 11', convert: (cgpa) => 7.1 * cgpa + 11 },
  { id: 'custom', name: 'Custom multiplier', formula: 'Percentage = CGPA × your multiplier', convert: (cgpa, multiplier) => cgpa * multiplier },
];

export const getFormula = (id) => FORMULAS.find((item) => item.id === id) ?? FORMULAS[0];

export function evaluate({ cgpa, formulaId, multiplier }) {
  const formula = getFormula(formulaId);
  const fields = {
    cgpa: checkNumber(cgpa, { required: 'Please enter your CGPA.', max: 10, minMessage: 'The CGPA must be between 0 and 10.', maxMessage: 'The CGPA must be between 0 and 10.' }),
    ...(formula.id === 'custom'
      ? { multiplier: checkNumber(multiplier, { required: 'Please enter the multiplier.', aboveMin: true, max: 100, minMessage: 'The multiplier must be greater than 0.', maxMessage: 'The multiplier must be 100 or less.' }) }
      : {}),
  };
  const { errors, values, isValid } = collectFields(fields);
  if (!isValid) return { errors };
  const raw = formula.convert(values.cgpa, values.multiplier);
  const percent = roundTo2(Math.min(100, Math.max(0, raw)));
  return { errors, result: { formula, cgpa: values.cgpa, multiplier: values.multiplier, percent, clipped: raw < 0 || raw > 100 } };
}

export const formatPercent = (value) => `${formatDecimal(value)}%`;

export function getRows({ formula, cgpa, multiplier, percent }) {
  return [
    { label: 'Percentage', value: formatPercent(percent) },
    { label: 'CGPA', value: `${formatDecimal(cgpa)} out of 10` },
    { label: 'Conversion used', value: formula.id === 'custom' ? `Percentage = CGPA × ${formatDecimal(multiplier)}` : formula.formula },
  ];
}

export const CLIPPED_NOTE = 'This conversion gives a value outside 0 to 100 for your CGPA, so the result is capped. Check that this conversion applies to your grade.';

export const buildResultText = (result) => [...getRows(result).map(({ label, value }) => `${label}: ${value}`), ...(result.clipped ? [CLIPPED_NOTE] : [])].join('\n');

export function buildReport(result) {
  const [main, cgpa, formula] = getRows(result);
  return {
    subtitle: result.formula.name,
    inputs: [cgpa, ...(result.formula.id === 'custom' ? [{ label: 'Multiplier', value: formatDecimal(result.multiplier) }] : [])],
    results: [main],
    details: [formula],
    notes: [...(result.clipped ? [CLIPPED_NOTE] : []), 'Universities set their own conversion rules. Use the conversion printed on your grade card or published by your university.'],
    formula: formula.value,
  };
}
