import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        dental: 'dental-demo.html',
        physio: 'physio-demo.html',
        estetica: 'estetica-demo.html',
        abogados: 'abogados-demo.html',
        'clinica-dental-malaga-demo': 'clinica-dental-malaga-demo.html',
        'clinica-dental-aurora-demo': 'clinica-dental-aurora-demo.html',
        'fisionova-demo': 'fisionova-demo.html',
        'educa-archidona-demo': 'educa-archidona-demo.html',
        'fisionova-premium-v2-pilot': 'fisionova-premium-v2-pilot.html',
        'lumen-dental-demo': 'lumen-dental-demo.html',
      },
    },
  },
})
