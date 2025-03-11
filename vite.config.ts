import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: '/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      },
      sourcemap: true
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'X-Auth-Token': env.VITE_FOOTBALL_API_KEY
          }
        }
      }
    }
  }
}) 
