import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Same-origin API calls in development so the httpOnly auth cookies
      // work without CORS. Override the backend address with API_PROXY_TARGET.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      css: false,
      restoreMocks: true,
    },
  }
})
