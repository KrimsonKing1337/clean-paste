import path from 'node:path';

import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => {
  const hmr = {
    protocol: 'ws',
    host,
    port: 1421,
  };

  return {
    plugins: [
      react(),
      svgr(),
    ],
    resolve: {
      alias: [
        {
          find: 'src',
          replacement: path.resolve(__dirname, 'src'),
        },
        {
          find: '@types',
          replacement: path.resolve(__dirname, 'src/@types'),
        },
        {
          find: 'assets',
          replacement: path.resolve(__dirname, 'src/assets'),
        },
        {
          find: 'components',
          replacement: path.resolve(__dirname, 'src/components'),
        },
        {
          find: 'styles',
          replacement: path.resolve(__dirname, 'src/styles'),
        },
        {
          find: 'utils',
          replacement: path.resolve(__dirname, 'src/utils'),
        },
      ],
    },

    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: hmr || undefined,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
  }
});
