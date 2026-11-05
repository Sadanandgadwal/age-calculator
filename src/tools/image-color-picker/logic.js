export const MAX_SIDE = 4096;
export const PALETTE_SIZE = 5;
const SAMPLE_SIDE = 200;
const OPAQUE_ENOUGH = 128;

export const fitScale = (width, height, maxSide = MAX_SIDE) => Math.min(1, maxSide / Math.max(width, height));
export const sampleScale = (width, height) => fitScale(width, height, SAMPLE_SIDE);

const toHexPart = (value) => value.toString(16).padStart(2, '0');
export const toHex = ({ r, g, b }) => `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}`.toUpperCase();

export function toHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l: Math.round(lightness * 100) };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === red) hue = ((green - blue) / delta + 6) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return { h: Math.round(hue * 60) % 360, s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
}

export function describeColor(color) {
  const { h, s, l } = toHsl(color);
  const opacity = Math.round((color.a / 255) * 100);
  return {
    hex: toHex(color),
    rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    opacity,
  };
}

export function getColorFacts(color) {
  const { hex, rgb, hsl, opacity } = describeColor(color);
  const facts = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: rgb },
    { label: 'HSL', value: hsl },
  ];
  return opacity < 100 ? [...facts, { label: 'Opacity', value: `${opacity}%` }] : facts;
}

export function findMainColors(data, count = PALETTE_SIZE) {
  const buckets = new Map();
  let total = 0;
  for (let index = 0; index + 3 < data.length; index += 4) {
    if (data[index + 3] < OPAQUE_ENOUGH) continue;
    const key = ((data[index] >> 4) << 8) | ((data[index + 1] >> 4) << 4) | (data[index + 2] >> 4);
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    bucket.r += data[index];
    bucket.g += data[index + 1];
    bucket.b += data[index + 2];
    bucket.count += 1;
    buckets.set(key, bucket);
    total += 1;
  }
  return [...buckets.values()]
    .sort((first, second) => second.count - first.count)
    .slice(0, count)
    .map((bucket) => ({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count),
      a: 255,
      share: Math.round((bucket.count / total) * 100),
    }));
}

export function pointFromEvent(event, rect, width, height) {
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * width);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * height);
  return { x: Math.min(width - 1, Math.max(0, x)), y: Math.min(height - 1, Math.max(0, y)) };
}

export function movePoint(point, key, width, height, isFine) {
  const step = isFine ? 1 : Math.max(1, Math.round(Math.max(width, height) / 100));
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  const move = moves[key];
  if (!move) return null;
  return { x: Math.min(width - 1, Math.max(0, point.x + move[0])), y: Math.min(height - 1, Math.max(0, point.y + move[1])) };
}

export function getText(color, palette) {
  const lines = getColorFacts(color).map(({ label, value }) => `${label}: ${value}`);
  if (palette.length) lines.push(`Main colors: ${palette.map(toHex).join(', ')}`);
  return lines.join('\n');
}

export function buildReport(color, palette, name) {
  return {
    inputs: [{ label: 'Image', value: name }],
    results: getColorFacts(color),
    details: palette.map((item, index) => ({ label: `Main color ${index + 1}`, value: `${toHex(item)} (${item.share}%)` })),
  };
}
