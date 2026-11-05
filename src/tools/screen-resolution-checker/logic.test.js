import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, describeDisplay, getAspectRatio, readDisplay } from './logic.js';

const display = { screenWidth: 1920, screenHeight: 1080, windowWidth: 1280, windowHeight: 720, pixelRatio: 1.25, colorDepth: 24, touchPoints: 0 };
const detail = (result, label) => result.details.find((item) => item.label === label).value;

describe('getAspectRatio', () => {
  it.each([
    [1920, 1080, '16:9'],
    [1280, 800, '8:5'],
    [390, 844, '195:422'],
    [0, 0, 'Unknown'],
  ])('%i × %i is %s', (width, height, ratio) => {
    expect(getAspectRatio(width, height)).toBe(ratio);
  });
});

describe('readDisplay', () => {
  it('reads from the browser', () => {
    const view = { screen: { width: 100, height: 200, colorDepth: 30 }, innerWidth: 10, innerHeight: 20, devicePixelRatio: 2, navigator: { maxTouchPoints: 5 } };
    expect(readDisplay(view)).toEqual({ screenWidth: 100, screenHeight: 200, windowWidth: 10, windowHeight: 20, pixelRatio: 2, colorDepth: 30, touchPoints: 5 });
  });
});

describe('describeDisplay', () => {
  const result = describeDisplay(display);

  it('describes the display', () => {
    expect(result.screen).toBe('1,920 × 1,080');
    expect(result.window).toBe('1,280 × 720');
    expect(result.pixelRatio).toBe('1.25');
    expect(detail(result, 'Physical Pixels (estimated)')).toBe('2,400 × 1,350');
    expect(detail(result, 'Aspect Ratio')).toBe('16:9');
    expect(detail(result, 'Orientation')).toBe('Landscape');
    expect(detail(result, 'Colour Depth')).toBe('24-bit');
    expect(detail(result, 'Touch Screen')).toBe('No');
  });

  it('recognises a phone', () => {
    const phone = describeDisplay({ ...display, screenWidth: 390, screenHeight: 844, touchPoints: 5 });
    expect(detail(phone, 'Orientation')).toBe('Portrait');
    expect(detail(phone, 'Touch Screen')).toBe('Yes');
  });

  it('builds the copied text and report', () => {
    expect(buildResultText(result)).toContain('Screen: 1,920 × 1,080');
    expect(buildReport(result).results[1]).toEqual({ label: 'Browser window', value: '1,280 × 720' });
  });
});
