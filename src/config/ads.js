/**
 * Google AdSense configuration. This is the only place ad settings are read.
 *
 * Ads stay off until a valid publisher ID and a slot ID are set through the
 * environment variables documented in .env.example.
 */
const PUBLISHER_ID_PATTERN = /^ca-pub-\d{10,20}$/;

export function getAdConfig(env = import.meta.env) {
  const publisherId = env.VITE_ADSENSE_PUBLISHER_ID ?? '';

  return {
    publisherId: PUBLISHER_ID_PATTERN.test(publisherId) ? publisherId : null,
    slots: {
      header: env.VITE_AD_SLOT_HEADER || null,
      inContent: env.VITE_AD_SLOT_IN_CONTENT || null,
      footer: env.VITE_AD_SLOT_FOOTER || null,
    },
  };
}

export const adConfig = getAdConfig();
