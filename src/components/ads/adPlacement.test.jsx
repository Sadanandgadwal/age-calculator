import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const TOOL_PATHS = [
  '/age-calculator',
  '/marks-percentage-calculator',
  '/percentage-calculator',
  '/kg-to-gram-converter',
  '/cm-to-feet-converter',
  '/date-calculator',
  '/gst-calculator',
  '/compress-pdf',
  '/unlock-pdf',
  '/protect-pdf',
  '/jpg-to-pdf',
  '/pdf-to-jpg',
  '/reorder-pdf-pages',
  '/rotate-pdf',
  '/delete-pdf-pages',
  '/extract-pdf-pages',
  '/split-pdf',
  '/merge-pdf',
  '/pdf-page-counter',
  '/image-to-text',
  '/passport-photo-maker',
  '/favicon-generator',
  '/image-cropper',
  '/image-resizer',
  '/image-compressor',
  '/image-color-picker',
  '/base64-to-image',
  '/image-to-base64',
  '/qr-code-scanner',
  '/barcode-generator',
  '/typing-speed-test',
  '/screen-resolution-checker',
  '/uptime-calculator',
  '/decision-maker',
  '/random-name-picker',
  '/dice-roller',
  '/coin-flip',
  '/sql-formatter',
  '/javascript-minifier',
  '/css-minifier',
  '/html-formatter',
  '/markdown-preview',
  '/regex-tester',
  '/jwt-decoder',
  '/hash-generator',
  '/uuid-generator',
  '/html-entity-encoder',
  '/url-encoder-decoder',
  '/base64-encoder-decoder',
  '/json-minifier',
  '/json-validator',
  '/json-formatter',
  '/qr-code-generator',
  '/password-generator',
  '/random-number-generator',
  '/lorem-ipsum-generator',
  '/slug-generator',
  '/text-sorter',
  '/find-replace-text',
  '/remove-extra-spaces',
  '/remove-duplicate-lines',
  '/text-reverser',
  '/case-converter',
  '/reading-time-calculator',
  '/line-counter',
  '/character-counter',
  '/word-counter',
  '/unix-timestamp-converter',
  '/work-hours-calculator',
  '/week-number-calculator',
  '/leap-year-checker',
  '/pomodoro-timer',
  '/day-of-week-calculator',
  '/business-days-calculator',
  '/time-zone-converter',
  '/stopwatch',
  '/countdown-timer',
  '/angle-converter',
  '/frequency-converter',
  '/energy-converter',
  '/pressure-converter',
  '/time-unit-converter',
  '/speed-converter',
  '/data-storage-converter',
  '/volume-converter',
  '/area-converter',
  '/temperature-converter',
  '/bill-split-calculator',
  '/discount-calculator',
  '/time-calculator',
  '/emi-calculator',
];
const units = () => [...document.querySelectorAll('ins.adsbygoogle')];
const scripts = () => document.querySelectorAll('script[src*="adsbygoogle"]');

async function renderApp(path) {
  const { default: App } = await import('../../App.jsx');
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { level: 1 });
}

describe('ad placement', () => {
  afterEach(() => {
    scripts().forEach((script) => script.remove());
    delete window.adsbygoogle;
    vi.unstubAllEnvs();
  });

  describe('without AdSense details', () => {
    it.each(['/', '/all-tools', ...TOOL_PATHS])('%s has no ad units or script', async (path) => {
      await renderApp(path);
      expect(units()).toHaveLength(0);
      expect(scripts()).toHaveLength(0);
      expect(screen.queryByText('Advertisement')).not.toBeInTheDocument();
    });
  });

  describe('with AdSense details', () => {
    beforeEach(() => {
      vi.resetModules();
      vi.stubEnv('VITE_ADSENSE_PUBLISHER_ID', 'ca-pub-1234567890123456');
      vi.stubEnv('VITE_AD_SLOT_HEADER', '111');
      vi.stubEnv('VITE_AD_SLOT_IN_CONTENT', '222');
      vi.stubEnv('VITE_AD_SLOT_FOOTER', '333');
    });

    afterEach(() => {
      vi.resetModules();
    });

    it.each(TOOL_PATHS)('%s shows labelled ads outside its form, with one script', async (path) => {
      await renderApp(path);

      expect(units().map((unit) => unit.dataset.adSlot)).toEqual(['111', '222', '333']);
      expect(screen.getAllByText('Advertisement')).toHaveLength(3);
      units().forEach((unit) => {
        expect(unit.closest('form')).toBeNull();
        expect(unit.className).toContain('min-h-');
      });
      expect(scripts()).toHaveLength(1);
    });

    it.each(['/', '/all-tools', '/calculators'])('%s shows one ad', async (path) => {
      await renderApp(path);
      expect(units()).toHaveLength(1);
      expect(scripts()).toHaveLength(1);
    });

    it.each(['/about', '/contact', '/no-such-page'])('%s shows no ads, as it has little content', async (path) => {
      await renderApp(path);
      expect(units()).toHaveLength(0);
      expect(scripts()).toHaveLength(0);
    });
  });
});
