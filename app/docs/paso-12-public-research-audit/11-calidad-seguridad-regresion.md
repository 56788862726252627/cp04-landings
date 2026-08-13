# 11 — Calidad, seguridad y regresión (verificado, no estimado)

Todo lo siguiente se ejecutó realmente en esta sesión, en el worktree
`/root/cp04-t-public-research-audit`, rama
`feature/public-research-digital-audit-20260721` (base:
`feature/natural-language-business-builder-20260721`, HEAD `8302780`).

| Comprobación | Resultado |
|---|---|
| Tests totales | **720/720** (542 preexistentes de Paso 09+10+11 + 178 nuevos de Paso 12: 167 del motor + 11 del CLI) |
| Lint | 4 errores + 1 warning — **idénticos y preexistentes** en `App.jsx`, `AuthContext.jsx`, `DemoSafeNotice.jsx`, `useTutorialOrchestrator.js` (verificados ANTES de tocar nada); 0 problemas nuevos en `research/` o `research-cli/` |
| Build | Limpio (`vite build` sin errores) |
| Escaneo de secretos | 2 falsos positivos verificados a mano: la propia definición del patrón `SECRET_LOOKALIKE` y un valor de prueba explícito (`sk_live_abc123456789`) en un test que verifica que el detector funciona — ningún secreto real |
| `business:doctor` (Paso 10) | Saludable — 32 puntos de extensión (20 + 12 nuevos de Paso 12), 2 negocios generados y válidos (sin cambios) |
| `research:doctor` (Paso 12) | Saludable — 13/13 adaptadores, 45/45 dimensiones, 10/10 presets, 10/10 fixtures, 10 auditorías generadas y válidas, modo offline por defecto confirmado |
| Demos ejecutadas | Las 10 del enunciado (A-J), no solo 4 |
| Repetición de demo | Las 10 repetidas → 0 creados/0 actualizados/13 preservados en cada una |
| `--strict` | Bloquea (0 archivos escritos, código de salida 2) en el caso G (contradicciones); no bloquea en un caso normal |
| URL inválida/privada/localhost/metadata/path traversal | 16 tests dedicados en `urlSafety.test.mjs`, todos pasan |
| Fixture corrupta / desconocida | Fail-soft verificado: continúa con el resto, registra limitación, no lanza |
| Snapshot vacío | Verificado: HTML vacío no lanza, produce evidencia válida |
| Sin llamadas de red reales | `grep -rn "fetch(\|http.request\|https.request\|XMLHttpRequest" src/saas-core/research research-cli` → 0 resultados |
| Sin credenciales | Ninguna variable de entorno con valor real; solo nombres referenciados (`credentialsNeeded` en los contratos) |
| `App.jsx` / `theme.js` / Worker / `tenants/demo/` | **Sin tocar** (`git diff --stat` vacío contra esos paths) |
| `tenant/tenantSchema.js` (tocado en Paso 11) | **Sin tocar en este paso** |
| Único archivo de Paso 10 modificado | `factory/extensionPoints.js` — aditivo: 12 puntos de extensión nuevos + `docsNote` enriquecido en 3 existentes, cero cambios de comportamiento (`getExtensionPoint`/`listExtensionPointIds`/`getExtensionPointWithMock` sin tocar) |
| PR #36 / #37 / #38 / #39 | Intactos — mismos `headRefOid` que al empezar este paso |
| Otros worktrees | Sin cambios (verificados por `git log -1` en cada uno) |
| Merge | Ninguno realizado |

## Errores preexistentes (no atribuibles a este paso)

Los 4 errores + 1 warning de lint existían ANTES de empezar (verificado
con `npm run lint` sobre el HEAD base `8302780`, sin ningún cambio de
Paso 12): 2 en `react-refresh/only-export-components`
(`AuthContext.jsx`, `DemoSafeNotice.jsx`), 2 en
`react-hooks/set-state-in-effect` (`App.jsx`), 1 warning
`react-hooks/exhaustive-deps` (`useTutorialOrchestrator.js`). Ninguno de
estos archivos fue tocado por Paso 12.

## Limitaciones honestas

- Ningún proveedor externo real conectado (búsqueda, mapas, reseñas,
  rendimiento, accesibilidad, SEO, IA) — todo mocks/offline.
- La obtención real de una URL pública no está implementada: `research:audit --url`
  produce evidencia `"unavailable"` explícita, nunca simula una respuesta.
- Sin captura real de mockups/PDF (depende de Playwright, no instalado).
- Los datos demo son sintéticos y ficticios — no aptos para un negocio
  real sin sustitución completa.
- El scoring y las recomendaciones son heurísticos y explicables, pero
  no sustituyen una auditoría profesional (especialmente para los 4
  sectores regulados, marcados explícitamente con `prudentNote`).
