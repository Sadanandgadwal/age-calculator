const SCRIPT_BASE = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/** Adds the AdSense script to the page once, however many ad slots are rendered. */
export function loadAdSense(publisherId) {
  const src = `${SCRIPT_BASE}?client=${publisherId}`;
  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}
