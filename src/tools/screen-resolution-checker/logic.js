import { formatNumber } from '../../utils/formatResult.js';

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

export function getAspectRatio(width, height) {
  if (!width || !height) return 'Unknown';
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export const size = (width, height) => `${formatNumber(width)} × ${formatNumber(height)}`;

export function readDisplay(view = window) {
  const { screen, innerWidth, innerHeight, devicePixelRatio, navigator } = view;
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: innerWidth,
    windowHeight: innerHeight,
    pixelRatio: devicePixelRatio,
    colorDepth: screen.colorDepth,
    touchPoints: navigator.maxTouchPoints ?? 0,
  };
}

export function describeDisplay(display) {
  const { screenWidth, screenHeight, windowWidth, windowHeight, pixelRatio, colorDepth, touchPoints } = display;
  return {
    screen: size(screenWidth, screenHeight),
    window: size(windowWidth, windowHeight),
    pixelRatio: String(Math.round(pixelRatio * 100) / 100),
    details: [
      { label: 'Physical Pixels (estimated)', value: size(Math.round(screenWidth * pixelRatio), Math.round(screenHeight * pixelRatio)) },
      { label: 'Aspect Ratio', value: getAspectRatio(screenWidth, screenHeight) },
      { label: 'Orientation', value: screenWidth >= screenHeight ? 'Landscape' : 'Portrait' },
      { label: 'Colour Depth', value: `${colorDepth}-bit` },
      { label: 'Touch Screen', value: touchPoints > 0 ? 'Yes' : 'No' },
    ],
  };
}

export const buildResultText = ({ screen, window: browserWindow, pixelRatio, details }) =>
  [`Screen: ${screen}`, `Window: ${browserWindow}`, `Pixel ratio: ${pixelRatio}`, ...details.map(({ label, value }) => `${label}: ${value}`)].join('\n');

export const buildReport = ({ screen, window: browserWindow, pixelRatio, details }) => ({
  results: [
    { label: 'Screen resolution', value: screen },
    { label: 'Browser window', value: browserWindow },
    { label: 'Pixel ratio', value: pixelRatio },
  ],
  details,
});
