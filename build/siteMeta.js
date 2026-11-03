const LOCAL_URL = 'http://localhost:4173';
const PLACEHOLDER = /__SITE_URL__/g;

/**
 * The public site URL. An explicit VITE_SITE_URL wins, otherwise Vercel's
 * production domain is used. Returns '' when neither is set.
 */
export function resolveSiteUrl(env) {
  const url =
    env.VITE_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  return url.replace(/\/+$/, '');
}

const robotsTxt = (siteUrl) => `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemapXml = (siteUrl) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`;

/** Search Console's ownership tag, added only when a verification code is configured. */
const verificationTag = (code) =>
  /^[\w-]+$/.test(code ?? '') ? `<meta name="google-site-verification" content="${code}" />` : '';

/** Writes the site URL into index.html's SEO tags and generates robots.txt and sitemap.xml. */
export function siteMeta(configuredUrl, googleVerification) {
  const siteUrl = configuredUrl || LOCAL_URL;

  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html
        .replace(PLACEHOLDER, siteUrl)
        .replace('<!--google-site-verification-->', verificationTag(googleVerification)),
    generateBundle() {
      if (!configuredUrl) {
        this.warn(`VITE_SITE_URL is not set, so SEO URLs point to ${LOCAL_URL}. Set it for production builds.`);
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl) });
    },
  };
}
