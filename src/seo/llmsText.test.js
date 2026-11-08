import { describe, expect, it } from 'vitest';
import { buildLlmsText } from './llmsText.js';
import { TOOLS } from '../data/toolsRegistry.js';
import { absoluteUrl } from './pageMeta.js';

describe('buildLlmsText', () => {
  it('starts with the site name and links every tool once', () => {
    const text = buildLlmsText();
    expect(text.startsWith('# ToolNest\n')).toBe(true);
    for (const { name, route } of TOOLS) {
      expect(text.split(`[${name}](${absoluteUrl(route)})`)).toHaveLength(2);
    }
  });
});
