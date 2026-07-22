# 04 — Informe técnico del Paso 14

## Resumen

Paso 14 generaliza el proveedor real único de Paso 13
(`publicWebsiteFetcher`) en una arquitectura de fábrica multiproveedor:
contrato uniforme (`ResearchProvider`), registro con descubrimiento
automático de plugins, 12 proveedores stub documentados (contratos
preparados, sin red real) + 1 wrapper del proveedor real existente, y un
pipeline configurable de ejecución (secuencial / paralelo / fallback, con
timeouts y cancelación).

## Estado al reanudar esta sesión

Al inspeccionar el worktree se encontró ya implementado y sin commitear:

- `providers/core/providerTypes.js` + test (Fase 1 — contrato y fábricas)
- `providers/core/providerRegistry.js` + test (Fase 1/2 — registro y `discoverAndRegisterPlugins`)
- `providers/core/providerPipeline.js` + test (Fase 4 — pipeline configurable)
- Los 13 plugins en `providers/plugins/` (12 stub + `publicWebsiteFetcherPlugin.js`) + `plugins.test.mjs`
- `publicWebsiteFetcherPlugin.test.mjs`

44 tests ya escritos y en verde (10 + 12 + 13 + 5 + 4), sobre un total de
521 líneas de código en `core/` + `plugins/`. No se recreó ni se
sobrescribió ninguno de estos archivos.

## Lo que se hizo en esta reanudación

1. **Auditoría del estado existente** (sin asumir nada): inspección de
   `git status`, lectura completa de `providerTypes.js`,
   `providerRegistry.js`, `providerPipeline.js`,
   `publicWebsiteFetcherPlugin.js`, los 12 stubs y los 3 archivos de test
   del núcleo + `plugins.test.mjs`, y verificación de que ningún archivo
   fuera de `providers/` importaba todavía el registro/pipeline nuevos.
2. **Fase 5 — integración con `research:doctor`**: nuevo check
   `multiprovider_registry_loaded` en
   `research-cli/lib/researchCli.mjs`, siguiendo la receta que el propio
   Paso 13 dejó escrita para futuros proveedores (documento 05, punto 9).
   Test dedicado añadido en `researchCli.test.mjs`.
3. **Corrección de lint introducido por el trabajo previo**: dos
   parámetros `_options` sin usar (`providerTypes.js` en
   `defineStubProvider`, `publicWebsiteFetcherPlugin.js`) rompían
   `no-unused-vars` bajo la configuración por defecto del repo (los
   parámetros con valor por defecto no quedan exentos por la regla
   `args: "after-used"`, a diferencia de un parámetro posicional sin
   default). Se resolvió eliminando los parámetros no usados de la firma
   en vez de silenciar la regla — ningún llamador dependía de esa
   aridad (se comprobó que ningún test invoca `.collect.length`).
4. **Documentación completa del paso** (este directorio).
5. Ejecución completa de tests, lint y build; commit atómico único.

## Verificación ejecutada

```
$ npm test                     → 812/812 tests, 0 fallos
$ npx eslint src/saas-core/research/providers  → 0 problemas
$ npm run build                → build correcto (mismo aviso preexistente de chunk >500kB, no relacionado)
$ node research-cli/research-doctor.mjs → 14/14 checks OK, incluido multiprovider_registry_loaded
```

## Alcance y lo que queda fuera

Por honestidad (mismo criterio que Pasos 12/13): esta arquitectura **no
sustituye** la llamada directa que `auditOrchestrator.js` sigue haciendo a
`collectFromPublicWebsite()`. El registro y el pipeline son un sistema
completo, probado de forma aislada y listo para usarse, pero
`runResearchAudit()` no pasa hoy por `runProviderPipeline()` —
verificado con `grep` de que ningún archivo fuera de `providers/`
importa `providerRegistry.js` ni `providerPipeline.js` salvo el nuevo
check de `research:doctor`.

Esto fue una decisión deliberada de alcance en esta reanudación, no un
olvido: conectar el pipeline al orquestador implica decidir semántica de
producto (¿qué dimensiones usan qué proveedor por defecto?, ¿modo
`fallback` o `sequential` para cada una?, ¿cómo interactúa con
`--allow-network`?) que excede "continuar lo pendiente sin recrear
trabajo existente" y merece su propio paso con las mismas garantías de
seguridad (SSRF, `allowNetwork` explícito) que ya tiene Paso 13.

De los 12 proveedores stub, **0 son reales todavía** — siguen siendo
contratos preparados y documentados, tal y como estaban al llegar. No se
implementó ninguna llamada de red nueva en esta sesión.

## Tiempo invertido

**Nota de honestidad**: no existe un cronómetro de sesión ni timestamps
de herramienta accesibles para medir tiempo de reloj real con precisión;
lo siguiente es una estimación razonada basada en el volumen de trabajo
observado, con el mismo criterio que Paso 13 usó para sus propias
estimaciones (documento 10 de ese paso).

| | Estimación |
|---|---|
| **Esta reanudación** (auditoría del estado existente + Fase 5 + fix de lint + documentación + verificación + commit/PR) | **~35-50 minutos** de trabajo — alcance deliberadamente acotado: 1 check nuevo + 1 test + 2 líneas de fix de lint + 6 documentos |
| **Trabajo ya realizado antes de la interrupción** (Fases 1-4: tipos, registro, descubrimiento, 12 stubs + wrapper real, pipeline, 44 tests, 521 líneas) | **~2.5-3.5 horas** estimadas — orden de magnitud comparable a una sesión de Paso 12/13 completa, dado el volumen de código y tests ya en verde al llegar |
| **Total Paso 14 (ambas partes)** | **~3-4 horas** estimadas |

Estas cifras son una estimación de ingeniería, no una métrica formal
medida con reloj.
