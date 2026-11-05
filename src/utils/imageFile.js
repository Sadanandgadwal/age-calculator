export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const MAX_IMAGE_SIDE = 12000;

const HEIC_PATTERN = /\.(heic|heif)$/i;
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const FORMAT_NAMES = { 'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WebP', 'image/gif': 'GIF', 'image/svg+xml': 'SVG', 'image/bmp': 'BMP', 'image/avif': 'AVIF', 'image/x-icon': 'ICO', 'image/vnd.microsoft.icon': 'ICO' };

const isHeic = (file) => /hei[cf]/i.test(file.type) || HEIC_PATTERN.test(file.name);

export const formatName = (type) => FORMAT_NAMES[type] ?? 'Image';

export function checkImageFile(file, maxBytes = MAX_IMAGE_BYTES) {
  if (!file.type.startsWith('image/') && !isHeic(file)) return 'Please choose an image file, such as a PNG or JPG.';
  if (file.size === 0) return 'This file is empty. Please choose another image.';
  if (file.size > maxBytes) return `This image is larger than ${formatBytes(maxBytes)}. Please choose a smaller one.`;
  return null;
}

export function checkImageDimensions(width, height) {
  if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS) return 'This image has too many pixels to process safely in a browser. The limit is 40 megapixels.';
  return null;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2).replace(/\.?0+$/, '')} MB`;
}

export function outputFilename(name, suffix, type) {
  const base = (name ?? '').replace(/\.[^.]*$/, '').replace(/[^\p{L}\p{M}\p{N}._ -]/gu, '').trim() || 'image';
  return `${base}-${suffix}.${EXTENSIONS[type] ?? 'png'}`;
}

export function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      if (image.naturalWidth && image.naturalHeight) resolve(image);
      else reject(new Error('unreadable'));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    image.src = url;
  });
}

export async function openImage(file, maxBytes) {
  const problem = checkImageFile(file, maxBytes);
  if (problem) throw new Error(problem);
  let image;
  try {
    image = await loadImage(file);
  } catch {
    throw new Error(isHeic(file) ? 'This browser cannot open HEIC photos. Please convert it to JPG first.' : 'This image could not be read. It may be damaged, so please try another one.');
  }
  const { naturalWidth: width, naturalHeight: height } = image;
  const tooLarge = checkImageDimensions(width, height);
  if (tooLarge) throw new Error(tooLarge);
  return { file, image, width, height, name: file.name, size: file.size, type: file.type };
}

export function drawToCanvas(image, { crop, width, height, background } = {}) {
  const source = crop ?? { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  const canvas = document.createElement('canvas');
  canvas.width = width ?? source.width;
  canvas.height = height ?? source.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not prepare the image.');
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function encodeCanvas(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('The image could not be created. It may be too large for this browser.'));
        else if (blob.type !== type) reject(Object.assign(new Error(`This browser cannot save ${formatName(type)} images. Please choose another format.`), { unsupported: true }));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

export const keptFormat = (type) => (EXTENSIONS[type] ? type : 'image/png');

export async function encodeKeepingFormat(canvas, type, quality = 0.92) {
  const wanted = keptFormat(type);
  try {
    return await encodeCanvas(canvas, wanted, quality);
  } catch (error) {
    if (!error.unsupported) throw error;
    return encodeCanvas(canvas, 'image/png');
  }
}

export const flattensTransparency = (sourceType, outputType) => outputType === 'image/jpeg' && sourceType !== 'image/jpeg';
