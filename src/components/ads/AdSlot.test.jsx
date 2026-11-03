import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdSlot from './AdSlot.jsx';
import { getAdConfig } from '../../config/ads.js';

const PUBLISHER_ID = 'ca-pub-1234567890123456';
const adScripts = () => document.querySelectorAll('script[src*="adsbygoogle"]');

describe('getAdConfig', () => {
  it('is disabled when nothing is configured', () => {
    expect(getAdConfig({})).toEqual({
      publisherId: null,
      slots: { header: null, inContent: null, footer: null },
    });
  });

  it('rejects a malformed publisher ID', () => {
    expect(getAdConfig({ VITE_ADSENSE_PUBLISHER_ID: 'ca-pub-XXXX' }).publisherId).toBeNull();
    expect(getAdConfig({ VITE_ADSENSE_PUBLISHER_ID: '1234567890123456' }).publisherId).toBeNull();
  });

  it('reads the publisher and slot IDs', () => {
    const config = getAdConfig({
      VITE_ADSENSE_PUBLISHER_ID: PUBLISHER_ID,
      VITE_AD_SLOT_HEADER: '111',
      VITE_AD_SLOT_IN_CONTENT: '222',
      VITE_AD_SLOT_FOOTER: '333',
    });
    expect(config.publisherId).toBe(PUBLISHER_ID);
    expect(config.slots).toEqual({ header: '111', inContent: '222', footer: '333' });
  });
});

describe('AdSlot', () => {
  afterEach(() => {
    adScripts().forEach((script) => script.remove());
    delete window.adsbygoogle;
  });

  it('renders nothing and loads no script when ads are not configured', () => {
    const { container } = render(<AdSlot placement="header" config={getAdConfig({})} />);
    expect(container).toBeEmptyDOMElement();
    expect(adScripts()).toHaveLength(0);
  });

  it('renders nothing when this placement has no slot ID', () => {
    const config = getAdConfig({ VITE_ADSENSE_PUBLISHER_ID: PUBLISHER_ID, VITE_AD_SLOT_HEADER: '111' });
    const { container } = render(<AdSlot placement="footer" config={config} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a labelled unit with reserved space, and loads the script once', () => {
    const config = getAdConfig({
      VITE_ADSENSE_PUBLISHER_ID: PUBLISHER_ID,
      VITE_AD_SLOT_HEADER: '111',
      VITE_AD_SLOT_FOOTER: '333',
    });

    render(
      <>
        <AdSlot placement="header" config={config} />
        <AdSlot placement="footer" config={config} />
      </>,
    );

    const [header] = screen.getAllByRole('complementary', { name: 'Advertisement' });
    const unit = header.querySelector('ins.adsbygoogle');
    expect(unit).toHaveAttribute('data-ad-client', PUBLISHER_ID);
    expect(unit).toHaveAttribute('data-ad-slot', '111');
    expect(unit.className).toContain('min-h-');

    expect(adScripts()).toHaveLength(1);
    expect(window.adsbygoogle).toHaveLength(2);
  });
});
