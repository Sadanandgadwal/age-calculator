import { baseName, describeParseError, divisionSteps, formatInBase, groupDigits, parseInBase, placeValueWorking } from './numberBase.js';

const OTHERS = [2, 8, 10, 16];
const GROUP = { 2: 4, 8: 3, 10: 3, 16: 4 };

export function convertPair(text, { from, to }) {
  if (!String(text ?? '').trim()) return {};
  const parsed = parseInBase(text, from);
  if (parsed.error) return { error: describeParseError(parsed.error, from, parsed.character) };
  const { value } = parsed;
  const steps = to === 10 ? null : divisionSteps(value, to);
  return {
    result: {
      input: String(text).trim(),
      from,
      to,
      output: formatInBase(value, to),
      working: from === 10 ? null : placeValueWorking(value, from),
      steps,
      others: OTHERS.filter((base) => base !== from && base !== to).map((base) => ({ label: baseName(base), value: groupDigits(formatInBase(value, base), GROUP[base]) })),
    },
  };
}

export function buildPairText({ input, from, to, output, working, steps, others }) {
  return [
    `${input} (${baseName(from).toLowerCase()}) = ${output} (${baseName(to).toLowerCase()})`,
    ...(working ? [`Working: ${working}`] : []),
    ...(steps ? [`Working: ${steps.map(({ dividend, quotient, remainder }) => `${dividend} ÷ ${to} = ${quotient} remainder ${remainder}`).join('; ')}. Remainders read from last to first: ${output.replace('-', '')}`] : []),
    ...others.map(({ label, value }) => `${label}: ${value}`),
  ].join('\n');
}

export function buildPairReport({ input, from, to, output, others }) {
  return {
    inputs: [{ label: baseName(from), value: input }],
    results: [{ label: baseName(to), value: output }],
    details: others,
  };
}
