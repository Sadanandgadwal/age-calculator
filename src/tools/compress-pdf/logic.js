import { formatBytes } from '../../utils/imageFile.js';
import { loadPdf, loadPdfLib } from '../../utils/pdfFile.js';
import { describeSaving } from '../../utils/textStats.js';

export const LEVELS = [
  { id: 'light', name: 'Light', maxSide: 2400, quality: 0.8, hint: 'Best image quality, smaller saving.' },
  { id: 'recommended', name: 'Recommended', maxSide: 1600, quality: 0.65, hint: 'Good quality for screens and most printing.' },
  { id: 'strong', name: 'Strong', maxSide: 1000, quality: 0.5, hint: 'Smallest file, lower image quality.' },
];

export const getLevel = (id) => LEVELS.find((level) => level.id === id) ?? LEVELS[1];

const MIN_GAIN = 0.9;

function nameOf(value, lib) {
  if (value instanceof lib.PDFName) return value.asString();
  if (value instanceof lib.PDFArray && value.size() === 1) return nameOf(value.get(0), lib);
  return null;
}

function colorComponents(dict, context, lib) {
  const space = context.lookup(dict.get(lib.PDFName.of('ColorSpace')));
  if (space instanceof lib.PDFName) return { '/DeviceRGB': 3, '/DeviceGray': 1 }[space.asString()] ?? null;
  if (space instanceof lib.PDFArray && space.size() === 2 && nameOf(space.get(0), lib) === '/ICCBased') {
    const profile = context.lookup(space.get(1));
    const count = profile?.dict ? context.lookup(profile.dict.get(lib.PDFName.of('N'))) : null;
    const value = count instanceof lib.PDFNumber ? count.asNumber() : null;
    return value === 1 || value === 3 ? value : null;
  }
  return null;
}

export function findImages(document, lib) {
  const { context } = document;
  const images = [];
  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (!(object instanceof lib.PDFRawStream)) continue;
    const get = (key) => context.lookup(object.dict.get(lib.PDFName.of(key)));
    if (nameOf(get('Subtype'), lib) !== '/Image' || nameOf(get('Filter'), lib) !== '/DCTDecode') continue;
    if (get('ImageMask') || get('Decode') || get('DecodeParms')) continue;
    const [bits, width, height] = [get('BitsPerComponent'), get('Width'), get('Height')];
    if (![bits, width, height].every((value) => value instanceof lib.PDFNumber) || bits.asNumber() !== 8) continue;
    const components = colorComponents(object.dict, context, lib);
    if (!components) continue;
    images.push({ ref, object, width: width.asNumber(), height: height.asNumber(), components, bytes: object.getContents() });
  }
  return images;
}

export function targetSize(width, height, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function replaceImage(document, lib, image, recoded) {
  const dict = image.object.dict.clone(document.context);
  dict.set(lib.PDFName.of('Width'), lib.PDFNumber.of(recoded.width));
  dict.set(lib.PDFName.of('Height'), lib.PDFNumber.of(recoded.height));
  if (recoded.components !== image.components) dict.set(lib.PDFName.of('ColorSpace'), lib.PDFName.of(recoded.components === 1 ? 'DeviceGray' : 'DeviceRGB'));
  document.context.assign(image.ref, lib.PDFRawStream.of(dict, recoded.bytes));
}

export async function compressPdf(bytes, levelId, recode, onProgress = () => {}) {
  const lib = await loadPdfLib();
  const level = getLevel(levelId);
  const document = await loadPdf(bytes);
  const images = findImages(document, lib);
  let replaced = 0;
  for (const [index, image] of images.entries()) {
    onProgress(index + 1, images.length);
    const recoded = await Promise.resolve()
      .then(() => recode(image, targetSize(image.width, image.height, level.maxSide), level.quality))
      .catch(() => null);
    if (recoded && recoded.bytes.length < image.bytes.length * MIN_GAIN) {
      replaceImage(document, lib, image, recoded);
      replaced += 1;
    }
  }
  const output = await document.save({ useObjectStreams: true });
  return { output, imageCount: images.length, replaced };
}

export function getOutcome(before, after) {
  return { ...describeSaving(before, after), smaller: after < before * 0.99 };
}

export function getFacts({ before, after, saved, percent }, imageCount, replaced) {
  return [
    { label: 'Original size', value: formatBytes(before) },
    { label: 'New size', value: formatBytes(after) },
    { label: 'Saved', value: `${formatBytes(saved)} (${percent}%)` },
    { label: 'Photos made smaller', value: `${replaced} of ${imageCount}` },
  ];
}

export function describeNoSaving(imageCount) {
  return imageCount === 0
    ? 'This PDF has no photos that can be made smaller. It is mostly text or drawings, which are already stored efficiently, so your original file is the smallest version.'
    : 'The photos in this PDF are already well compressed, so a smaller version could not be made. Try the Strong level, or keep your original file.';
}
