import { formatBytes, formatName } from '../../utils/imageFile.js';

export function getFacts(source, crop, blob) {
  return [
    { label: 'Cropped size', value: `${crop.width} × ${crop.height} px` },
    { label: 'Position', value: `${crop.x}, ${crop.y} px from the top left` },
    { label: 'Original', value: `${source.width} × ${source.height} px` },
    { label: 'File', value: `${formatBytes(blob.size)}, ${formatName(blob.type)}` },
  ];
}

export function getNote(source, type) {
  if (type !== source.type && source.type !== 'image/png') return `${formatName(source.type)} cannot be saved here, so this was saved as ${formatName(type)}.`;
  return null;
}

export const cropKey = (crop) => `${crop.x},${crop.y},${crop.width},${crop.height}`;
