import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `backups/`, `audit/`, `deploy-pages/`, `deploy-preview/` guardan copias,
  // auditorías y bundles ya minificados (algunos > 500KB en una sola línea).
  // Sin este ignore, `eslint .` los recorre igual que al código fuente:
  // en un checkpoint con ~22k archivos en backups/ (25GB) eso ha llegado a
  // colgar `npm run lint` más de 20 minutos y a agotar memoria.
  globalIgnores([
    'dist',
    'backups',
    'audit',
    'deploy-pages',
    'deploy-preview',
    'make-blueprints',
    'workflows',
    'pdf-comercial-antequera',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
