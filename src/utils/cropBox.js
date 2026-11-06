export const MIN_CROP = 8;

export const RATIOS = [
  { id: 'free', name: 'Free', value: null },
  { id: '1:1', name: '1:1', value: 1 },
  { id: '4:3', name: '4:3', value: 4 / 3 },
  { id: '3:2', name: '3:2', value: 3 / 2 },
  { id: '16:9', name: '16:9', value: 16 / 9 },
  { id: '9:16', name: '9:16', value: 9 / 16 },
];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function initialCrop(width, height, ratio, fill = 0.8) {
  let cropWidth = width * fill;
  let cropHeight = height * fill;
  if (ratio) {
    if (cropWidth / cropHeight > ratio) cropWidth = cropHeight * ratio;
    else cropHeight = cropWidth / ratio;
  }
  cropWidth = Math.max(1, Math.round(cropWidth));
  cropHeight = Math.max(1, Math.round(cropHeight));
  return { x: Math.round((width - cropWidth) / 2), y: Math.round((height - cropHeight) / 2), width: cropWidth, height: cropHeight };
}

export function moveCrop(crop, dx, dy, width, height) {
  return { ...crop, x: Math.round(clamp(crop.x + dx, 0, width - crop.width)), y: Math.round(clamp(crop.y + dy, 0, height - crop.height)) };
}

export function resizeCrop(crop, handle, dx, dy, width, height, ratio) {
  const growsRight = handle.includes('e');
  const growsDown = handle.includes('s');
  const anchorX = growsRight ? crop.x : crop.x + crop.width;
  const anchorY = growsDown ? crop.y : crop.y + crop.height;
  const maxWidth = growsRight ? width - anchorX : anchorX;
  const maxHeight = growsDown ? height - anchorY : anchorY;
  const minWidth = Math.min(MIN_CROP, maxWidth);
  const minHeight = Math.min(MIN_CROP, maxHeight);

  let nextWidth = clamp((growsRight ? 1 : -1) * dx + crop.width, minWidth, maxWidth);
  let nextHeight = clamp((growsDown ? 1 : -1) * dy + crop.height, minHeight, maxHeight);
  if (ratio) {
    nextWidth = Math.min(nextWidth, maxHeight * ratio);
    nextWidth = Math.max(nextWidth, Math.min(minHeight * ratio, maxWidth, maxHeight * ratio));
    nextHeight = nextWidth / ratio;
  }
  nextWidth = Math.max(1, Math.round(nextWidth));
  nextHeight = Math.max(1, Math.min(Math.round(nextHeight), maxHeight));
  return { x: growsRight ? anchorX : anchorX - nextWidth, y: growsDown ? anchorY : anchorY - nextHeight, width: nextWidth, height: nextHeight };
}

export function cropFromKey(crop, key, isResize, width, height, ratio) {
  const step = Math.max(1, Math.round(Math.max(width, height) / 100));
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  const move = moves[key];
  if (!move) return null;
  if (!isResize) return moveCrop(crop, move[0], move[1], width, height);
  const [dx, dy] = ratio && move[1] !== 0 ? [move[1] * ratio, move[1]] : move;
  return resizeCrop(crop, 'se', dx, dy, width, height, ratio);
}
