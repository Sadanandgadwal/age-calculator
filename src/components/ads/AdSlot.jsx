import { useEffect, useRef } from 'react';
import { adConfig } from '../../config/ads.js';
import { loadAdSense } from '../../utils/loadAdSense.js';

// Reserved height for each placement, which prevents layout shift when an ad loads.
const RESERVED_HEIGHT = {
  header: 'min-h-[100px] md:min-h-[90px]',
  inContent: 'min-h-[250px]',
  footer: 'min-h-[100px] md:min-h-[90px]',
};

function ActiveAd({ publisherId, slotId, placement, className }) {
  const requested = useRef(false);

  useEffect(() => {
    // StrictMode runs effects twice in development, and AdSense rejects a second request.
    if (requested.current) return;
    requested.current = true;

    loadAdSense(publisherId);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // A blocked or failed ad must never affect the calculator.
    }
  }, [publisherId]);

  return (
    <aside aria-label="Advertisement" className={`mx-auto max-w-6xl print:hidden ${className}`}>
      <p className="mb-1 text-center text-xs text-ink/80">Advertisement</p>
      <ins
        className={`adsbygoogle block ${RESERVED_HEIGHT[placement]}`}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

/**
 * Renders a real AdSense unit, or nothing until the publisher ID and this
 * placement's slot ID are configured. It never shows a placeholder or fake ad.
 */
export default function AdSlot({ placement, className = '', config = adConfig }) {
  const { publisherId, slots } = config;
  const slotId = slots[placement];

  if (!publisherId || !slotId) return null;

  return <ActiveAd publisherId={publisherId} slotId={slotId} placement={placement} className={className} />;
}
