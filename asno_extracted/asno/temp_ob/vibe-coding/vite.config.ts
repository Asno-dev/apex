import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'false' ? true : false,
      proxy: {
        // Computer Mode — direct execution sandbox (packages/computer)
        '/api/computer': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/computer/, ''),
        },
        '/api/sandbox': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/sandbox/, '/sandbox'),
        },
        // Desktop Mode — NestJS orchestrator (packages/agent)
        '/api/desktop': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/desktop/, ''),
        },
      },
    },
  };
});
