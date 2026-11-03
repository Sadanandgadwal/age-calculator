import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const LOCAL_URL = 'http://localhost:4173';

/**
 * Makes `npm run preview` serve pages the way Vercel does: /page uses page/index.html,
 * and an unknown URL gets 404.html with a real 404 status.
 */
function servePrerenderedPages(distDir) {
  return (req, res, next) => {
    const [path, query] = req.url.split('?');
    if (path === '/' || extname(path)) return next();

    const page = `${path.replace(/\/+$/, '')}/index.html`;
    if (existsSync(join(distDir, page))) {
      req.url = query ? `${page}?${query}` : page;
      return next();
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    return res.end(readFileSync(join(distDir, '404.html')));
  };
}

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

/** Search Console's ownership tag, added only when a verification code is configured. */
const verificationTag = (code) =>
  /^[\w-]+$/.test(code ?? '') ? `<meta name="google-site-verification" content="${code}" />` : '';

/** Adds site-wide tags to index.html and generates robots.txt. scripts/prerender.mjs writes the sitemap. */
export function siteMeta(configuredUrl, googleVerification) {
  const siteUrl = configuredUrl || LOCAL_URL;

  return {
    name: 'site-meta',
    configurePreviewServer(server) {
      server.middlewares.use(servePrerenderedPages(server.config.build.outDir));
    },
    transformIndexHtml: (html) => html.replace('<!--google-site-verification-->', verificationTag(googleVerification)),
    generateBundle() {
      if (!configuredUrl) {
        this.warn(`VITE_SITE_URL is not set, so SEO URLs point to ${LOCAL_URL}. Set it for production builds.`);
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
    },
  };
}
