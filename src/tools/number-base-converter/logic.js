import { baseName, describeParseError, formatInBase, groupDigits, parseInBase } from '../../utils/numberBase.js';

export const BASES = Array.from({ length: 35 }, (_, index) => index + 2).map((base) => ({ id: String(base), name: `${baseName(base)}${[2, 8, 10, 16].includes(base) ? ` (base ${base})` : ''}` }));

export const COMMON = [2, 8, 10, 16];

const GROUP = { 2: 4, 8: 3, 10: 3, 16: 4 };

export const display = (value, base) => {
  const text = formatInBase(value, base);
  return GROUP[base] ? groupDigits(text, GROUP[base]) : text;
};

export function convert(text, from, to) {
  if (!String(text ?? '').trim()) return {};
  const parsed = parseInBase(text, from);
  if (parsed.error) return { error: describeParseError(parsed.error, from, parsed.character) };
  return {
    result: {
      input: String(text).trim(),
      from,
      to,
      value: parsed.value,
      output: formatInBase(parsed.value, to),
      common: COMMON.map((base) => ({ base, label: baseName(base), value: display(parsed.value, base) })),
    },
  };
}

export const buildResultText = ({ input, from, to, output, common }) =>
  [`${input} (${baseName(from).toLowerCase()}) = ${output} (${baseName(to).toLowerCase()})`, ...common.map(({ label, value }) => `${label}: ${value}`)].join('\n');

export function buildReport({ input, from, to, output, common }) {
  return {
    inputs: [
      { label: 'Number', value: input },
      { label: 'From', value: baseName(from) },
      { label: 'To', value: baseName(to) },
    ],
    results: [{ label: baseName(to), value: output }],
    details: common.filter(({ base }) => base !== to).map(({ label, value }) => ({ label, value })),
  };
}
