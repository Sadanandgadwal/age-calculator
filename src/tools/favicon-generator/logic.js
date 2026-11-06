export const FITS = [
  { id: 'cover', name: 'Crop to square' },
  { id: 'contain', name: 'Fit inside' },
];

export const BACKGROUNDS = [
  { id: 'transparent', name: 'Transparent' },
  { id: 'color', name: 'Color' },
];

export const ICONS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180, opaque: true },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

export const ICO_SIZES = [16, 32, 48];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const SNIPPET = [
  '<link rel="icon" href="/favicon.ico" sizes="48x48">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
  '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="manifest" href="/site.webmanifest">',
].join('\n');

export function placement(width, height, size, fitId) {
  if (fitId === 'cover') {
    const side = Math.min(width, height);
    return { source: { x: (width - side) / 2, y: (height - side) / 2, width: side, height: side }, target: { x: 0, y: 0, width: size, height: size } };
  }
  const scale = size / Math.max(width, height);
  const targetWidth = width * scale;
  const targetHeight = height * scale;
  return { source: { x: 0, y: 0, width, height }, target: { x: (size - targetWidth) / 2, y: (size - targetHeight) / 2, width: targetWidth, height: targetHeight } };
}

export function buildIco(images) {
  const headerSize = 6 + images.length * 16;
  const total = images.reduce((sum, image) => sum + image.bytes.length, headerSize);
  const output = new Uint8Array(total);
  const view = new DataView(output.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    output[entry] = image.size >= 256 ? 0 : image.size;
    output[entry + 1] = image.size >= 256 ? 0 : image.size;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, image.bytes.length, true);
    view.setUint32(entry + 12, offset, true);
    output.set(image.bytes, offset);
    offset += image.bytes.length;
  });
  return output;
}

export const isHexColor = (value) => HEX_COLOR.test(value);

export function buildManifest(siteName, color) {
  const name = siteName.trim();
  const manifest = {
    ...(name ? { name, short_name: name.length > 12 ? name.slice(0, 12).trim() : name } : {}),
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: color,
    background_color: color,
    display: 'standalone',
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
