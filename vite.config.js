import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolveSiteUrl, siteMeta } from './build/siteMeta.js';

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), 'VITE_') };
  const siteUrl = resolveSiteUrl(env);

  return {
    plugins: [react(), tailwindcss(), siteMeta(siteUrl, env.VITE_GOOGLE_SITE_VERIFICATION)],
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: false,
      restoreMocks: true,
    },
  };
});
