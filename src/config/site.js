/** Site-wide values. The public URL comes from the build, see vite.config.js. */
export const siteConfig = {
  name: 'Age Calculator',
  tagline: 'Calculate your exact age in years, months and days.',
  url: import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
};
