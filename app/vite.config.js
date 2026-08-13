import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    watch: {
      // No seguir symlinks al vigilar archivos: varios worktrees de este
      // proyecto comparten un único node_modules real mediante symlinks
      // encadenados (para no reinstalar dependencias en cada worktree).
      // Con followSymlinks (true por defecto en chokidar), el watcher
      // resuelve cada symlink y vigila el directorio real completo —
      // multiplicando por cada worktree los mismos ~4700 archivos de
      // node_modules, y agotando los watchers de inotify del sistema
      // (ENOSPC) cuando hay varios `npm run dev` abiertos a la vez. Con
      // followSymlinks:false, el symlink en sí se vigila como una única
      // entrada, sin descender a su destino.
      followSymlinks: false,
      ignored: [
        "**/audit/**",
        "**/audits/**",
        "**/docs/**",
        "**/backups/**",
        "**/checkpoints/**",
        "**/benchmark*/**",
        "**/benchmarks-capturas/**",
        "**/playtomic/**",
        "**/vola/**",
        "**/deploy-pages/**",
        "**/deploy-preview/**",
        "**/dist/**",
        "**/node_modules/**",
        "**/.git/**",
        "**/.claude/**"
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
