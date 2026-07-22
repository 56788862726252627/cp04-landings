# 07 — Informe técnico del Paso 13 (verificado, no estimado)

Ejecutado en `/root/cp04-t-real-web-provider`, rama
`feature/real-public-website-provider-20260722` (base:
`feature/public-research-digital-audit-20260721`, HEAD inicial `f59b516`).

## Alcance implementado

- Proveedor real `publicWebsiteFetcher`: validación de URL (esquema,
  credenciales embebidas, longitud, normalización determinista),
  protección SSRF en 2 capas (estática + DNS con IP pinneada),
  redirecciones acotadas y revalidadas, control de petición (timeout,
  tamaño máximo, sin cookies/auth, MIME allowlist, `AbortController`),
  robots.txt (fail-open), extracción reutilizando `htmlSignals.js` de
  Paso 12, manejo de errores estructurado (12 códigos).
- Integración con el motor de Paso 12: 2 modos nuevos
  (`public-web`/`hybrid`) + bandera de ejecución `allowNetwork`
  (nunca inferida ni persistida), gate reforzado en `--dry-run`.
- CLI: `--mode`, `--allow-network`, `--provider`, `--timeout`,
  `--max-bytes`, `--max-pages`, `--respect-robots`, `--user-agent` en
  `research:collect`, `research:audit`, `business:research`.
- `research:doctor`: 2 checks nuevos (`network_modes_registered`,
  `public_website_fetcher_provider_loaded`), sin tocar el check existente
  de "extension points not_implemented".

## Archivos

- **Nuevos**: `providers/publicWebsiteFetcher.js`, su test (30 tests),
  su test opcional de red real (4 tests, no en el conteo de CI), 9
  documentos de este paso. Total nuevo: 12 archivos.
- **Modificados (aditivos, todos con tests que lo confirman)**: `package.json`
  (+1 script), `urlSafety.js`, `evidenceSchema.js`, `researchRequestSchema.js`,
  `auditOrchestrator.js`, `auditReportGenerator.js`,
  `research-cli/lib/researchCli.mjs`, `research-audit.mjs`,
  `research-collect.mjs`, `business-research.mjs`, y sus tests
  correspondientes. Total modificado: 13 archivos.
- `factory/extensionPoints.js` (Paso 10): **sin tocar**.

## Tests

| | Cantidad |
|---|---|
| Preexistentes (Paso 09-12) | 720 |
| Nuevos — motor (`src/saas-core/research/`) | 41 |
| Nuevos — CLI (`research-cli/`) | 6 |
| **Total** | **767/767 en verde** |
| Opcionales de red real (no contados arriba, no en CI) | 4/4 en verde (ejecutados manualmente con `ALLOW_REAL_NETWORK_TESTS=1`) |

## Lint / Build / Secretos

- Lint: 4 errores + 1 warning — idénticos a los preexistentes de Paso 09
  (`App.jsx`, `AuthContext.jsx`, `DemoSafeNotice.jsx`,
  `useTutorialOrchestrator.js`), 0 nuevos.
- Build: limpio.
- Secretos: 0 reales — 2 falsos positivos ya conocidos de Paso 12
  (definición del patrón `SECRET_LOOKALIKE` y un valor de prueba
  explícito), reverificados.
- Archivos grandes (>500KB): ninguno nuevo.
- Symlinks: ninguno commiteado (el symlink de `node_modules` usado
  localmente para tooling se elimina antes del commit).

## Idempotencia

- Confirmada con datos REALES (no solo fixtures): auditoría contra
  `example.com` ejecutada dos veces → 0 archivos creados/actualizados,
  13 preservados en la 2ª ejecución.
- Se detectó y corrigió un bug real de idempotencia durante esta misma
  validación (`fetchedAt` embebido en la evidencia persistida) — ver
  documento 06.

## Proveedor real conectado

`publicWebsiteFetcher` — único proveedor de red implementado en este
paso. `research:doctor` confirma que carga y pasa su propio
`healthCheck()`.

## URLs realmente consultadas durante esta sesión

- `https://example.com/` (auditoría completa, dos veces, para probar idempotencia)
- `https://example.com/ruta-que-no-existe-de-verdad-12345` (prueba de degradación controlada, 404 real)
- (Tests opcionales de red real, bajo `ALLOW_REAL_NETWORK_TESTS=1`): `https://example.com/`, `http://localhost/` (para confirmar que SIGUE bloqueado incluso con red real habilitada), `https://example.com/ruta-inexistente-para-pruebas-reales-12345`

Ningún negocio real de un tercero ni competidor fue auditado.
