import { minify, syntax } from 'csso/dist/csso.esm';
import { formatNumber } from '../../utils/formatResult.js';
import { byteLength, describeSaving } from '../../utils/textStats.js';

export function findProblems(text) {
  const problems = [];
  syntax.parse(text, { positions: true, onParseError: ({ message, line, column }) => problems.push({ message, line, column }) });
  return problems;
}

export function evaluate(text, restructure) {
  if (!text.trim()) return { error: null, result: null };
  try {
    const problems = findProblems(text);
    const output = minify(text, { restructure }).css;
    return { error: null, result: { output, problems, ...describeSaving(byteLength(text), byteLength(output)) } };
  } catch (error) {
    return { error: `This CSS could not be read: ${error.message}`, result: null };
  }
}

export const describeProblems = ({ problems }) => {
  if (problems.length === 0) return null;
  const { line, column, message } = problems[0];
  const count = problems.length === 1 ? 'A part of your CSS' : `${formatNumber(problems.length)} parts of your CSS`;
  return `${count} could not be read and may be missing from the result. First at line ${line}, column ${column}: ${message}.`;
};

export const bytes = (value) => `${formatNumber(value)} ${value === 1 ? 'byte' : 'bytes'}`;

export function buildReport(result, restructure) {
  const note = describeProblems(result);
  return {
    inputs: [{ label: 'Merge matching rules', value: restructure ? 'Yes' : 'No' }],
    results: [
      { label: 'Saved', value: `${result.percent}%` },
      { label: 'Minified size', value: bytes(result.after) },
      { label: 'Original size', value: bytes(result.before) },
    ],
    text: { title: 'Minified CSS', value: result.output, mono: true },
    notes: note ? [note] : null,
  };
}
