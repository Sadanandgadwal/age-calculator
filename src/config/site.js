/** Site-wide values. The public URL comes from the build, see vite.config.js. */
export const siteConfig = {
  name: 'ToolNest',
  tagline: 'Free, simple and powerful online tools to make everyday calculations easier.',
  url:
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4173'),
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? '',
  author: { name: 'Sadanand Gadwal', url: 'https://sadanandgadwal.com' },
};
