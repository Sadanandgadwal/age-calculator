import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolveSiteUrl, siteMeta } from './build/siteMeta.js';

export default defineConfig(({ mode }) => {
  const siteUrl = resolveSiteUrl({ ...process.env, ...loadEnv(mode, process.cwd(), 'VITE_') });

  return {
    plugins: [react(), tailwindcss(), siteMeta(siteUrl)],
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
