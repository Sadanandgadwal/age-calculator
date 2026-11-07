import { formatBytes } from '../../utils/imageFile.js';

export const MAX_IMAGES = 100;
const MM = 72 / 25.4;
const PIXEL_TO_POINT = 0.75;

export const PAGE_SIZES = [
  { id: 'fit', name: 'Same as image' },
  { id: 'a4', name: 'A4', width: 595.28, height: 841.89 },
  { id: 'letter', name: 'Letter', width: 612, height: 792 },
];

export const MARGINS = [
  { id: 'none', name: 'No margin', size: 0 },
  { id: 'small', name: 'Small margin', size: 10 * MM },
];

export function layoutImage(imageWidth, imageHeight, sizeId, marginId) {
  const margin = MARGINS.find((item) => item.id === marginId).size;
  const size = PAGE_SIZES.find((item) => item.id === sizeId);
  if (!size.width) {
    const width = imageWidth * PIXEL_TO_POINT;
    const height = imageHeight * PIXEL_TO_POINT;
    return { page: [width + 2 * margin, height + 2 * margin], image: { x: margin, y: margin, width, height } };
  }
  const isLandscape = imageWidth > imageHeight;
  const pageWidth = isLandscape ? size.height : size.width;
  const pageHeight = isLandscape ? size.width : size.height;
  const scale = Math.min((pageWidth - 2 * margin) / imageWidth, (pageHeight - 2 * margin) / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { page: [pageWidth, pageHeight], image: { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height } };
}

export function getFacts(count, blob) {
  return [
    { label: 'Images', value: String(count) },
    { label: 'Pages', value: String(count) },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
