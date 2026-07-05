import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    watch: {
      ignored: [
        "**/audit/**",
        "**/audits/**",
        "**/docs/**",
        "**/backups/**",
        "**/benchmark*/**",
        "**/benchmarks-capturas/**",
        "**/playtomic/**",
        "**/vola/**",
        "**/deploy-pages/**",
        "**/deploy-preview/**",
        "**/dist/**",
        "**/node_modules/**",
        "**/.git/**"
      ],
    },
    proxy: {
      '/api': {
        target: 'https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
