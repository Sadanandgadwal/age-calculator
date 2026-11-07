import { toHex, toHsl } from '../image-color-picker/logic.js';

const FORMAT_HELP = 'Please enter a colour such as #1A73E8, rgb(26, 115, 232), hsl(214, 82%, 51%), hsv(214, 89%, 91%) or cmyk(89%, 50%, 0%, 9%).';

export function hslToRgb(h, s, l) {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  return fromChroma(h, chroma, lightness - chroma / 2);
}

export function hsvToRgb(h, s, v) {
  const chroma = (v / 100) * (s / 100);
  return fromChroma(h, chroma, v / 100 - chroma);
}

function fromChroma(hue, chroma, offset) {
  const sector = (((hue % 360) + 360) % 360) / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [r, g, b] = [[chroma, second, 0], [second, chroma, 0], [0, chroma, second], [0, second, chroma], [second, 0, chroma], [chroma, 0, second]][Math.floor(sector) % 6];
  return { r: Math.round((r + offset) * 255), g: Math.round((g + offset) * 255), b: Math.round((b + offset) * 255) };
}

export const cmykToRgb = (c, m, y, k) => ({
  r: Math.round(255 * (1 - c / 100) * (1 - k / 100)),
  g: Math.round(255 * (1 - m / 100) * (1 - k / 100)),
  b: Math.round(255 * (1 - y / 100) * (1 - k / 100)),
});

export function toHsv({ r, g, b }) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const { h } = toHsl({ r, g, b });
  return { h, s: max === 0 ? 0 : Math.round(((max - min) / max) * 100), v: Math.round(max * 100) };
}

export function toCmyk({ r, g, b }) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const part = (value) => Math.round(((1 - value / 255 - k) / (1 - k)) * 100);
  return { c: part(r), m: part(g), y: part(b), k: Math.round(k * 100) };
}

const channel = (value) => {
  const scaled = value / 255;
  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};
export const luminance = ({ r, g, b }) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
export function contrast(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}

const numbers = (text) => text.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];

export function parseColor(input) {
  const text = String(input ?? '').trim().toLowerCase();
  if (!text) return {};
  const hex = text.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1];
    return { color: { r: parseInt(digits.slice(0, 2), 16), g: parseInt(digits.slice(2, 4), 16), b: parseInt(digits.slice(4, 6), 16) } };
  }
  const values = numbers(text);
  const kind = text.match(/^(rgb|hsl|hsv|hsb|cmyk)a?\s*\(/)?.[1] ?? (/^[\d.\s,]+$/.test(text) ? 'rgb' : null);
  if (!kind) return { error: FORMAT_HELP };
  if (kind === 'cmyk') {
    if (values.length !== 4 || values.some((value) => value < 0 || value > 100)) return { error: 'CMYK needs four values from 0 to 100, such as cmyk(89%, 50%, 0%, 9%).' };
    return { color: cmykToRgb(...values) };
  }
  if (values.length < 3 || values.length > 4) return { error: FORMAT_HELP };
  const [first, second, third] = values;
  if (kind === 'rgb') {
    if ([first, second, third].some((value) => value < 0 || value > 255)) return { error: 'RGB values must be from 0 to 255.' };
    return { color: { r: Math.round(first), g: Math.round(second), b: Math.round(third) } };
  }
  if (second < 0 || second > 100 || third < 0 || third > 100) return { error: 'Saturation, lightness and value must be from 0 to 100%.' };
  return { color: kind === 'hsl' ? hslToRgb(first, second, third) : hsvToRgb(first, second, third) };
}

export function describe(color) {
  const hsl = toHsl(color);
  const hsv = toHsv(color);
  const cmyk = toCmyk(color);
  const white = contrast(color, { r: 255, g: 255, b: 255 });
  const black = contrast(color, { r: 0, g: 0, b: 0 });
  return {
    color,
    hex: toHex(color),
    rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    white,
    black,
    better: white >= black ? 'white' : 'black',
  };
}

export const convert = (input) => {
  const { color, error } = parseColor(input);
  return color ? { result: describe(color) } : { error };
};

const rating = (ratio) => (ratio >= 7 ? 'passes AAA' : ratio >= 4.5 ? 'passes AA' : ratio >= 3 ? 'large text only' : 'fails');

export function getRows(result) {
  return [
    { label: 'HEX', value: result.hex },
    { label: 'RGB', value: result.rgb },
    { label: 'HSL', value: result.hsl },
    { label: 'HSV', value: result.hsv },
    { label: 'CMYK', value: result.cmyk },
    { label: 'Contrast with white text', value: `${result.white} : 1, ${rating(result.white)}` },
    { label: 'Contrast with black text', value: `${result.black} : 1, ${rating(result.black)}` },
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(result, input) {
  const rows = getRows(result);
  return {
    inputs: [{ label: 'Colour entered', value: String(input).trim() }],
    results: rows.slice(0, 2),
    details: rows.slice(2),
    notes: ['CMYK values are a simple conversion. Printed colours depend on the printer and paper.'],
  };
}
