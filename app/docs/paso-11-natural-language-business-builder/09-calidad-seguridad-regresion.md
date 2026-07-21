# 09 — Calidad, seguridad y regresión

## Tests

- Preexistentes (Paso 09 + Paso 10): **396** — todos siguen pasando sin modificación.
- Nuevos de este paso: **146** (`542 - 396`), repartidos en:
  - `nl-builder/*.test.mjs`: 129 — `aiProviderContract` 9, `ambiguityEngine` 9,
    `automationCatalog` 6, `blueprintComposer` 10, `brandingLandingProposal` 7,
    `businessIntentSchema` 14, `confidenceEngine` 6, `demoRequests` 10,
    `inputNormalizer` 10, `intentExtractor` 11, `moduleDependencyEngine` 11,
    `outputSerializer` 8, `roleEngine` 8, `sectorLexicon` 10.
  - `factory-cli/lib/nlBuilderCli.test.mjs`: 17.
- **Total: 542/542 en verde.**

Ningún test nuevo comprueba solo `assert(true)`: todos verifican resultados concretos
(valores exactos, listas, orden, presencia/ausencia de campos), siguiendo el mismo
estilo que Paso 09/10.

## Lint

`npm run lint` (eslint): **4 errores + 1 warning**, exactamente los mismos y en los
mismos 4 archivos que existían **antes** de empezar este paso (`App.jsx`,
`auth/AuthContext.jsx`, `components/demo/DemoSafeNotice.jsx`,
`hooks/useTutorialOrchestrator.js`) — verificado como baseline al inicio de la sesión,
antes de tocar nada. Ninguno de esos 4 archivos fue modificado por Paso 11. Durante el
desarrollo se introdujo un error nuevo real (`no-unused-vars` en
`brandingLandingProposal.js`) y se corrigió antes de continuar (ver commit/diff).

## Build

`npm run build` (vite): limpio, mismo tamaño de bundle que antes de este paso (ningún
archivo de `src/` fuera de `nl-builder/` fue tocado en el frontend).

## Escaneo de secretos

Escaneo de todos los archivos nuevos/modificados contra patrones de credenciales reales
(`sk_live_`, `sk_test_`, `whsec_`, claves de Google/Slack, bloques `PRIVATE KEY`, claves
AWS `AKIA...`): **sin coincidencias reales**. Dos falsos positivos identificados y
verificados manualmente: (1) `tenantSchema.js` línea 333 es la propia definición del
patrón de detección (`SECRET_LOOKALIKE`), no un secreto; (2)
`businessIntentSchema.test.mjs` contiene deliberadamente el string `sk_live_12345` como
dato de prueba para verificar que el validador **rechaza** ese tipo de valor. Ningún
dato personal real (nombre, email, teléfono) fuera de valores claramente de
`ejemplo`/`demo`.

## Equivalencia de Club Pádel 04

No se modificó `tenants/demo/` ni ningún archivo de dominio/UI de la aplicación
principal. Los tests preexistentes que verifican explícitamente la equivalencia de
Club Pádel 04 (`listTenantsOnDisk siempre incluye club-padel-04...`,
`validateTenantOnDisk('club-padel-04') valida el tenant de producción sin tocar
disco...`) siguen en verde sin cambios.

## Idempotencia

Verificada en tres niveles independientes:

1. **Unitario:** `intentExtractor.test.mjs`/`blueprintComposer.test.mjs` comprueban
   `deepEqual` entre dos llamadas con el mismo texto+seed.
2. **Las 8 demos:** `demoRequests.test.mjs` comprueba determinismo e idempotencia de
   dry-run para las 8 combinaciones del enunciado.
3. **CLI real (no solo tests):** la clínica de fisioterapia se generó dos veces con
   `business:from-prompt --execute`; la segunda ejecución mostró **0 archivos
   creados/actualizados, 16 preservados** (ver 07). Verificado también manualmente con
   `--dry-run` (git status sin cambios) y `--strict` ante una ambigüedad bloqueante
   (código de salida 2, git status sin cambios).

## Revisión de git diff / otros worktrees

- Diff completo revisado contra `c8f3ff0` (HEAD de Paso 10): solo 4 archivos existentes
  modificados (los 3 descritos en 00-indice.md + `package.json`), el resto son archivos
  nuevos dentro de `nl-builder/`, `factory-cli/`, `docs/paso-11-...` y el negocio demo
  generado.
- Los otros 6 worktrees del repositorio (`cp04-landings`, `cp04-t-frontend-fixes`,
  `cp04-t1-data-governance`, `cp04-t7-customer-success`, `cp04-t8-commercial`,
  `cp04-t8-resilience`) permanecen exactamente en el mismo commit que al empezar esta
  sesión.
- Las PR #36, #37 y #38 permanecen abiertas, sin merge, en el mismo `headRefOid` que al
  empezar esta sesión.

## Errores preexistentes (no atribuidos a este paso)

Los 4 errores + 1 warning de lint ya existían en `App.jsx`/`AuthContext.jsx`/
`DemoSafeNotice.jsx`/`useTutorialOrchestrator.js` antes de cualquier cambio de Paso 11
(verificado como primer paso de esta sesión, antes de escribir código). No se modificó
ninguno de esos archivos para "esconder" o "corregir" esos errores.
