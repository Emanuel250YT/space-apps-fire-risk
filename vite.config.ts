import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

/**
 * Mounts the production server's API handler inside Vite's dev server, so
 * `npm run dev` is one process on one port. Loading it through Vite applies the
 * `@/` alias and picks up edits to the server code without a restart.
 */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const api = (await server.ssrLoadModule('/src/server/api.ts')) as typeof import('@/server/api');
          if (!api.handleApi(req, res)) next();
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the app under /<repo>/; the Pages workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), devApi()],
  resolve: {
    alias: [{ find: /^@\//, replacement: `${srcDir}/` }],
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
