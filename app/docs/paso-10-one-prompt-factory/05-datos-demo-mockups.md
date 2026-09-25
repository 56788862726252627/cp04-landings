# Paso 10 · Fases 7-8 — Datos demo y mockups

## Fase 7 — Datos demo por sector (`demoDataGenerator.js`)

A diferencia de Paso 09 (donde `demoData` era solo `{enabled, source}`),
`generateDemoDataset({sector, terminology, commonServices, seed, sizes})`
produce **registros reales**: clientes, profesionales, servicios, recursos,
horarios, citas, comunicaciones, automatizaciones, una foto de métricas e
incidencias — todos con `isDemoData: true`.

- **Determinismo**: PRNG `mulberry32` sembrado por `seed` (string o
  número, convertido a entero de forma estable). Sin dependencias, sin
  `Math.random()`, sin `Date.now()` en la generación de datos. Misma
  entrada → mismo dataset byte a byte (verificado con `assert.deepEqual`
  en test).
- **Sin datos reales**: nombres de un banco de nombres genéricos
  (`FIRST_NAMES`/`LAST_NAMES`), cada nombre generado termina en `(demo)` —
  imposible confundirlo con un cliente real.
- **Consistencia referencial**: `checkDatasetReferentialIntegrity(dataset)`
  verifica que toda `appointment.customerId/resourceId/staffId` exista, y
  que las comunicaciones/incidencias referencien citas reales. El
  orquestador llama a esta función y aborta (`BusinessFactoryError`) si
  detecta inconsistencia — nunca se escribe un dataset roto a disco.
- **Tamaños configurables**: `blueprint.demoData.sizes` (customers,
  professionals, appointments, incidents, resources).

Tests: `demoDataGenerator.test.mjs` (7 tests).

## Fase 8 — Mockups responsive (`mockupManifest.js`)

`VIEWPORT_PRESETS`: los 4 breakpoints pedidos — móvil (375×812),
tablet (834×1194), portátil (1366×768), escritorio (1920×1080), cada uno
con `deviceScaleFactor` realista.

`buildMockupManifest({businessId, routes, viewports})` genera una entrada
por combinación ruta×viewport con **nombre estable**
(`<businessId>__<routeId>__<viewportId>`) y `captured: false` — ninguna
captura real ocurre en este paso. El manifest queda listo para que una
herramienta futura (Playwright u otra) lo consuma sin cambiar su forma.

`PLATFORM_COMPATIBILITY_NOTES` documenta, sin afirmar que ya se ha probado,
la compatibilidad prevista vía PWA/navegador en Android, iOS, iPadOS,
Windows, macOS y Linux — todas con `status: "planned"`.

No se añadió Playwright como dependencia nueva (el repositorio no lo tenía
y añadirlo está fuera del alcance mínimo de este paso); `business:doctor`
detecta en tiempo de ejecución si está disponible (`import("playwright")`
con `catch`) y lo reporta sin fallar si no lo está.

Tests: `mockupManifest.test.mjs` (5 tests).
