import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    proxy: {
      '/api/composio': {
        target: 'https://backend.composio.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/composio/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Composio Proxy Error]', err.message);
          });
        }
      }
    },
    allowedHosts: true
  }
})
