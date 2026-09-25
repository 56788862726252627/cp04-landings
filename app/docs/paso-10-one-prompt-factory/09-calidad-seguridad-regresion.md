# Paso 10 · Fase 14 — Calidad, seguridad y regresión

Todos los comandos siguientes se ejecutaron realmente en esta sesión desde
`/root/cp04-t-saas-core/app`, tras completar la Fase 12.

## Tests

```
npm test          → 396 tests, 396 pass, 0 fail (304 preexistentes de Paso 09 + 92 nuevos de Paso 10)
npm run test:worker → 173 tests, 173 pass, 0 fail (Worker, sin tocar, sin cambio respecto a antes de este paso)
```

Desglose de los 92 tests nuevos:

| Archivo | Tests |
|---|---|
| `businessBlueprintSchema.test.mjs` | 15 |
| `brandingEngine.test.mjs` | 10 |
| `demoDataGenerator.test.mjs` | 7 |
| `blueprintToTenant.test.mjs` | 6 |
| `landingGenerator.test.mjs` | 7 |
| `mockupManifest.test.mjs` | 5 |
| `extensionPoints.test.mjs` | 6 |
| `nlToBlueprintContract.test.mjs` | 8 |
| `docsGenerator.test.mjs` | 6 |
| `orchestrator.test.mjs` | 10 |
| `factory-cli/lib/businessCli.test.mjs` | 12 |
| **Total** | **92** |

## Lint

```
npm run lint → 5 problemas (4 errores, 1 warning)
```

Los mismos 4 errores/1 warning que existían **antes** de empezar este paso
(verificado ejecutando `npm run lint` al principio de la sesión, antes de
escribir ningún archivo nuevo): `App.jsx` (1 warning), `AuthContext.jsx`,
`DemoSafeNotice.jsx` (2 errores `react-refresh/only-export-components`),
`useTutorialOrchestrator.js`. Ninguno de estos 4 archivos fue tocado en
este paso — son preexistentes y ajenos a Paso 10. Se detectaron y
corrigieron 2 errores nuevos introducidos durante el desarrollo (variables
sin usar en `docsGenerator.js` y `orchestrator.js`) antes de este informe.

## Build

```
npm run build → vite build, "built in ~1.5-5s", 0 errores nuevos
```

El único aviso ("algunos chunks superan 500 kB") es preexistente y no
relacionado con el código de este paso (el código de `saas-core/factory` y
`factory-cli` es Node puro, no se importa desde el bundle de Vite).

## Escaneo de secretos

- El validador de blueprint y el orquestador rechazan/abortan ante
  cualquier patrón `sk_live|sk_test|whsec_|AIza|xox[baprs]-` (verificado en
  tests dedicados en 3 capas: schema, orquestador, CLI).
- `grep -rE "(sk_live|sk_test|whsec_|AIza|xox[baprs]-)"` sobre
  `factory-cli/` y `src/saas-core/factory/` solo encuentra la propia
  definición del patrón de detección y un fixture de test deliberadamente
  inválido (`secretLookalike`) — ningún secreto real.
- `grep` de dominios de email personales reales (gmail/hotmail/yahoo/outlook)
  → vacío.

## Búsqueda de datos reales / duplicación

- Todos los nombres de `demoDataGenerator.js` terminan en `(demo)` —
  ninguno coincide con datos reales del proyecto (`cp04DemoData.js` no se
  importa ni se referencia).
- `CORE_MODULE_CATALOG` no se redefine en ningún archivo de `factory/` —
  búsqueda confirmó 0 ocurrencias.

## Archivos grandes

El archivo más grande generado por este paso es `businessBlueprintSchema.js`
(20 KB de código fuente) y el dataset demo generado (`dataset.json`, 24 KB)
— ambos razonables, sin binarios ni assets pesados.

## Validación de rutas e imports

- `businessId` (usado como nombre de directorio de salida) está forzado
  por el esquema a `SLUG_PATTERN` (`^[a-z0-9]+(-[a-z0-9]+)*$`) — un intento
  de path traversal (`../../etc/passwd`) es rechazado por
  `validateBusinessBlueprint` **antes** de que el orquestador toque el
  sistema de archivos (verificado manualmente en esta sesión).
- Todos los imports nuevos son rutas relativas dentro de `app/`; ningún
  import nuevo hacia `App.jsx`, `rbac.js`, `theme.js`, `authTypes.js` ni el
  Worker.

## Equivalencia de Club Pádel 04

`moduleRegistry.test.mjs` (Paso 09, sin modificar) sigue verificando que
`getEnabledSectionsForRole(CLUB_PADEL_04_TENANT, rol)` es idéntico a
`CP04_ROLE_PERMISSIONS` de `rbac.js` para los 4 roles — parte de los 304
tests preexistentes, todos en verde.

## Idempotencia

Verificada dos veces: por test automatizado (`orchestrator.test.mjs`,
directorios temporales) y por ejecución real de la CLI (Fase 12,
`business:create -- --example=full` dos veces seguidas → 0 creados/0
actualizados en la segunda).

## Revisión de `git diff` / otros worktrees

```
$ git status --short
 M app/package.json
?? app/factory-cli/
?? app/src/saas-core/businesses/
?? app/src/saas-core/factory/
```

Sin cambios fuera de lo esperado. Los 6 otros worktrees activos
(`cp04-landings`, `cp04-t-frontend-fixes`, `cp04-t1-data-governance`,
`cp04-t7-customer-success`, `cp04-t8-commercial`, `cp04-t8-resilience`)
se verificaron con `git status` al inicio y al final de la sesión: ningún
cambio nuevo causado por este trabajo (el estado "sucio" preexistente en
`cp04-landings` y `cp04-t8-commercial` es de sesiones anteriores, ajeno a
este paso). Las PR #36 y #37 no se tocaron (ninguna rama de sus worktrees
fue modificada ni se hizo push a ellas).
