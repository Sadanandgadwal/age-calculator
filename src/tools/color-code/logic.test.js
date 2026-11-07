import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, cmykToRgb, contrast, convert, hslToRgb, hsvToRgb, parseColor, toCmyk, toHsv } from './logic.js';

describe('parseColor', () => {
  it('reads every supported format', () => {
    const blue = { r: 26, g: 115, b: 232 };
    expect(parseColor('#1A73E8').color).toEqual(blue);
    expect(parseColor('1a73e8').color).toEqual(blue);
    expect(parseColor('rgb(26, 115, 232)').color).toEqual(blue);
    expect(parseColor('26 115 232').color).toEqual(blue);
    expect(parseColor('#fff').color).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('hsl(0, 100%, 50%)').color).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor('hsv(120, 100%, 100%)').color).toEqual({ r: 0, g: 255, b: 0 });
    expect(parseColor('cmyk(0%, 0%, 100%, 0%)').color).toEqual({ r: 255, g: 255, b: 0 });
  });

  it('explains what is wrong', () => {
    expect(parseColor('')).toEqual({});
    expect(parseColor('red').error).toMatch(/^Please enter a colour such as #1A73E8/);
    expect(parseColor('rgb(300, 0, 0)').error).toBe('RGB values must be from 0 to 255.');
    expect(parseColor('hsl(10, 120%, 50%)').error).toBe('Saturation, lightness and value must be from 0 to 100%.');
    expect(parseColor('cmyk(1, 2, 3)').error).toBe('CMYK needs four values from 0 to 100, such as cmyk(89%, 50%, 0%, 9%).');
  });
});

describe('conversions', () => {
  it('converts between models', () => {
    expect(hslToRgb(214, 82, 51)).toEqual({ r: 28, g: 116, b: 233 });
    expect(hsvToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 });
    expect(cmykToRgb(0, 0, 0, 100)).toEqual({ r: 0, g: 0, b: 0 });
    expect(toHsv({ r: 26, g: 115, b: 232 })).toEqual({ h: 214, s: 89, v: 91 });
    expect(toCmyk({ r: 26, g: 115, b: 232 })).toEqual({ c: 89, m: 50, y: 0, k: 9 });
    expect(toCmyk({ r: 0, g: 0, b: 0 })).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it('works out WCAG contrast', () => {
    expect(contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBe(21);
    expect(contrast({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 })).toBe(1);
  });
});

describe('results', () => {
  it('describes a colour and builds the text and report', () => {
    const { result } = convert('#1A73E8');
    expect(result).toMatchObject({ hex: '#1A73E8', hsl: 'hsl(214, 82%, 51%)', cmyk: 'cmyk(89%, 50%, 0%, 9%)', white: 4.51, black: 4.66, better: 'black' });
    expect(buildResultText(result)).toContain('Contrast with white text: 4.51 : 1, passes AA');
    expect(buildResultText(convert('#777777').result)).toContain('large text only');
    const report = buildReport(result, ' #1a73e8 ');
    expect(report.inputs).toEqual([{ label: 'Colour entered', value: '#1a73e8' }]);
    expect(report.results).toEqual([{ label: 'HEX', value: '#1A73E8' }, { label: 'RGB', value: 'rgb(26, 115, 232)' }]);
  });
});
