import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/reservas': {
        target: 'https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
