import { parseDecimal } from '../../utils/number.js';

export const UNITS = [
  { id: 'tsp', name: 'Teaspoon (US)', short: 'tsp', kind: 'volume', factor: 4.92892159375 },
  { id: 'tbsp', name: 'Tablespoon (US)', short: 'tbsp', kind: 'volume', factor: 14.78676478125 },
  { id: 'cup', name: 'Cup (US)', short: 'cup', kind: 'volume', factor: 236.5882365 },
  { id: 'mcup', name: 'Metric cup (250 ml)', short: 'metric cup', kind: 'volume', factor: 250 },
  { id: 'floz', name: 'Fluid ounce (US)', short: 'fl oz', kind: 'volume', factor: 29.5735295625 },
  { id: 'ml', name: 'Millilitre', short: 'ml', kind: 'volume', factor: 1 },
  { id: 'l', name: 'Litre', short: 'l', kind: 'volume', factor: 1000 },
  { id: 'g', name: 'Gram', short: 'g', kind: 'weight', factor: 1 },
  { id: 'kg', name: 'Kilogram', short: 'kg', kind: 'weight', factor: 1000 },
  { id: 'oz', name: 'Ounce', short: 'oz', kind: 'weight', factor: 28.349523125 },
  { id: 'lb', name: 'Pound', short: 'lb', kind: 'weight', factor: 453.59237 },
];

export const INGREDIENTS = [
  { id: 'water', name: 'Water', density: 1 },
  { id: 'milk', name: 'Milk', density: 1.03 },
  { id: 'flour', name: 'All-purpose flour (maida)', density: 0.53 },
  { id: 'atta', name: 'Whole wheat flour (atta)', density: 0.51 },
  { id: 'sugar', name: 'White sugar', density: 0.85 },
  { id: 'brown', name: 'Brown sugar, packed', density: 0.93 },
  { id: 'icing', name: 'Powdered sugar', density: 0.51 },
  { id: 'butter', name: 'Butter or ghee', density: 0.96 },
  { id: 'oil', name: 'Cooking oil', density: 0.92 },
  { id: 'rice', name: 'Rice, uncooked', density: 0.78 },
  { id: 'honey', name: 'Honey', density: 1.42 },
  { id: 'salt', name: 'Table salt', density: 1.22 },
  { id: 'cocoa', name: 'Cocoa powder', density: 0.42 },
];

export const getUnit = (id) => UNITS.find((unit) => unit.id === id);
export const getIngredient = (id) => INGREDIENTS.find((item) => item.id === id) ?? INGREDIENTS[0];
const formatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
export const formatAmount = (value) => (value !== 0 && Math.abs(value) < 0.01 ? '< 0.01' : formatter.format(value));

export function convert(text, fromId, toId, ingredientId) {
  if (!String(text ?? '').trim()) return {};
  const value = parseDecimal(text);
  if (value === null) return { error: 'Please enter a number, without commas or symbols.' };
  if (value < 0) return { error: "Amounts can't be negative." };
  if (value > 1e9) return { error: 'This amount is too large to convert.' };
  const from = getUnit(fromId);
  const to = getUnit(toId);
  const ingredient = getIngredient(ingredientId);
  const crosses = from.kind !== to.kind;
  let base = value * from.factor;
  if (crosses) base = from.kind === 'volume' ? base * ingredient.density : base / ingredient.density;
  const output = base / to.factor;
  return {
    result: {
      value,
      output,
      from,
      to,
      ingredient: crosses ? ingredient : null,
      summary: `${formatAmount(value)} ${from.short}${crosses ? ` of ${ingredient.name.toLowerCase()}` : ''} = ${formatAmount(output)} ${to.short}`,
      oneCup: crosses ? `1 US cup of ${ingredient.name.toLowerCase()} ≈ ${formatAmount(236.5882365 * ingredient.density)} g` : null,
    },
  };
}

export const NOTE = 'Weights from cups and spoons are averages. How firmly an ingredient is packed changes the weight, so use a kitchen scale when it matters.';

export const buildResultText = (result) => [result.summary, ...(result.oneCup ? [result.oneCup, NOTE] : [])].join('\n');

export function buildReport(result) {
  return {
    inputs: [
      { label: 'Amount', value: `${formatAmount(result.value)} ${result.from.short}` },
      { label: 'Convert to', value: result.to.name },
      ...(result.ingredient ? [{ label: 'Ingredient', value: result.ingredient.name }] : []),
    ],
    results: [{ label: 'Result', value: result.summary }],
    details: result.oneCup ? [{ label: 'Reference', value: result.oneCup }] : [],
    notes: result.ingredient ? [NOTE] : [],
  };
}
