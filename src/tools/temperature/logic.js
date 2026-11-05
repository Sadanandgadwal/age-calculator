import { parseDecimal } from '../../utils/number.js';
import { formatQuantity, relation } from '../../utils/unitConversion.js';

export const TEMPERATURE_UNITS = [
  { id: 'c', name: 'Celsius', symbol: '°C' },
  { id: 'f', name: 'Fahrenheit', symbol: '°F' },
  { id: 'k', name: 'Kelvin', symbol: 'K' },
];

const KELVIN_OFFSET = 273.15;
const clean = (value) => Number(value.toPrecision(12));

const toCelsius = { c: (t) => t, f: (t) => ((t - 32) * 5) / 9, k: (t) => t - KELVIN_OFFSET };
const fromCelsius = { c: (t) => t, f: (t) => (t * 9) / 5 + 32, k: (t) => t + KELVIN_OFFSET };

const FORMULAS = {
  'c-f': '°F = (°C × 9/5) + 32',
  'f-c': '°C = (°F − 32) × 5/9',
  'c-k': 'K = °C + 273.15',
  'k-c': '°C = K − 273.15',
  'f-k': 'K = (°F − 32) × 5/9 + 273.15',
  'k-f': '°F = (K − 273.15) × 9/5 + 32',
};

export const convertTemperature = (value, fromId, toId) => clean(fromCelsius[toId](toCelsius[fromId](value)));

export function evaluateTemperature(text, fromId, toId, units = TEMPERATURE_UNITS) {
  if (!String(text ?? '').trim()) return {};

  const value = parseDecimal(text);
  if (value === null) return { error: 'Please enter a valid number.' };

  const kelvin = clean(fromCelsius.k(toCelsius[fromId](value)));
  if (kelvin < 0) return { error: 'This is below absolute zero (−273.15 °C), the lowest possible temperature.' };
  if (!Number.isFinite(kelvin)) return { error: 'This value is too large to convert.' };

  const from = units.find(({ id }) => id === fromId);
  const to = units.find(({ id }) => id === toId);
  const output = convertTemperature(value, fromId, toId);
  const outputText = formatQuantity(output);

  return {
    result: {
      value,
      output,
      from,
      to,
      outputText: `${outputText} ${to.symbol}`,
      summary: `${formatQuantity(value)} ${from.symbol} ${relation(output, outputText)} ${outputText} ${to.symbol}`,
      formula: FORMULAS[`${fromId}-${toId}`] ?? 'No conversion is needed for the same unit.',
    },
  };
}
