import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        "**/audit/**",
        "**/benchmarks-capturas/**",
        "**/benchmark*/**",
        "**/playtomic/**",
        "**/vola/**",
        '**/audit/**',
        '**/docs/**',
        '**/benchmark*/**',
        '**/benchmarks-capturas/**',
        '**/playtomic/**',
        '**/vola/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**'
      ]
    }
  },
  server: {
    host: '0.0.0.0',
    watch: {
      ignored: [
        "**/backups/**",
        "**/deploy-pages/**",
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
