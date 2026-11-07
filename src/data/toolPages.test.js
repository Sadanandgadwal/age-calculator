import { describe, expect, it } from 'vitest';
import { getToolPage, preloadToolPage } from './toolPages.js';
import { TOOLS, getToolByRoute } from './toolsRegistry.js';

describe('preloadToolPage', () => {
  it('makes every tool page available straight away', async () => {
    for (const tool of TOOLS) {
      await preloadToolPage(tool.route);
      const { default: page } = await tool.load();
      expect(getToolPage(tool), tool.id).toBe(page);
    }
  }, 60000);

  it('accepts a trailing slash', async () => {
    await expect(preloadToolPage('/gst-calculator/')).resolves.toBeUndefined();
    expect(getToolByRoute('/gst-calculator')).toBeTruthy();
  });

  it('ignores pages that are not tools', async () => {
    await expect(preloadToolPage('/')).resolves.toBeUndefined();
    await expect(preloadToolPage('/about')).resolves.toBeUndefined();
    await expect(preloadToolPage('/no-such-page')).resolves.toBeUndefined();
  });
});

describe('getToolPage', () => {
  it('always returns something renderable', () => {
    TOOLS.forEach((tool) => expect(getToolPage(tool), tool.id).toBeTruthy());
  });
});
