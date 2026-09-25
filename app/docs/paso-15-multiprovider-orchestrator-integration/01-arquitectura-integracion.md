# 01 — Arquitectura de integración

## OrchestratorProviderBridge (`providers/orchestratorProviderBridge.js`)

Único punto de contacto entre `auditOrchestrator.js` y el registro/pipeline
de Paso 14. `collectEvidence()` (auditOrchestrator.js) recibe una opción
nueva `pipeline: "legacy" | "multiprovider"` (por defecto `"legacy"`):

```js
if (pipeline === "multiprovider") {
  const bridgeResult = await collectEvidenceViaProviders(urls, { ... });
  // evidence, limitations, providerRunSummary, provenanceIndex, networkUsed, consultedUrls
} else if (urls.length > 0 && networkEnabled) {
  // Paso 12/13/14 SIN CAMBIOS: collectFromPublicWebsite(urls, networkLimits)
} else {
  // Paso 12/13/14 SIN CAMBIOS: evidenceForUnavailableUrl(url, ...)
}
```

El branch legacy es **exactamente** el código de Paso 13/14 — no se tocó
una sola línea de esa rama, solo se envolvió en un `else if`. Los 18 tests
de `auditOrchestrator.test.mjs` de Paso 12/13/14 pasan sin ninguna
modificación, confirmando bit a bit la compatibilidad.

`collectEvidenceViaProviders(urls, options)` solo reemplaza la parte de
**resolución de URLs**: `localFiles`, `fixtures` y `competitors` siguen
pasando por los 13 adaptadores offline (`sourceAdapters.js`) exactamente
igual en ambos modos — nunca se tocaron.

## Import circular evitado a propósito

`orchestratorProviderBridge.js` NO importa `auditOrchestrator.js` (que sí
lo importa a él). La función `evidenceForUnavailableUrl` (para producir la
MISMA evidencia "no disponible" que el modo legacy) se **inyecta** como
parámetro desde `auditOrchestrator.js`, en vez de duplicar el mensaje o
crear un ciclo de módulos. `collectEvidenceViaProviders` lanza si no se le
pasa — ningún caller silencioso puede olvidarlo.

## ProviderExecutionPolicy (`providerExecutionPolicy.js`)

Normaliza y congela la configuración de una ejecución: `pipeline`,
`execution` (sequential/parallel/fallback), `includeProviders` (allowlist
o `null`=todos), `excludeProviders`, `providerPriorityOverrides`,
`maxConcurrency`, `globalTimeoutMs`, `individualTimeoutMs`, `strict`,
`allowNetwork`, `profileId`. `applyExecutionPolicyToRegistry(registry,
policy)` aplica todo eso al `ProviderRegistry` de Paso 14 sin que
`providerRegistry.js` tenga que saber nada de política — separación
limpia entre "qué proveedores existen" (Paso 14) y "cuáles se usan esta
vez y en qué orden" (Paso 15).

## Cadena de proveedores: por qué NO se usa `resolveFallbackChain(dimension)`

`ProviderRegistry.resolveFallbackChain(dimension)` (Paso 14) compara **una
sola dimensión** a la vez — pensado para cuando cada proveedor recibe un
`collect()` con input específico de esa dimensión. Este puente hace **una
única llamada de recolección compartida** (`{urls, limits}`) para todos
los proveedores, con el mismo input, exactamente como hacía Paso 13. Se
detectó y corrigió en este mismo paso un bug real: llamar a
`resolveFallbackChain("*")` solo devuelve proveedores que declaran
`dimensions: ["*"]` (hoy, únicamente `publicWebsiteFetcher`) — ningún
stub (que declara dimensiones concretas como `"seoTechnical"`) aparecería
nunca en la cadena, pese a que un perfil lo recomendara. La cadena real
usada es `registry.list({ onlyEnabled: true })` (todos los habilitados,
por prioridad): "recomendado" en un perfil se traduce en **prioridad más
alta** (se intenta antes), no en ser el único proveedor considerado —
"excluido" sigue siendo el único mecanismo de bloqueo duro. Ver el test de
regresión en `orchestratorProviderBridge.test.mjs` ("los stubs con
dimensiones concretas SÍ se intentan").

## Política de ejecución (Fase 3)

| Capacidad | Dónde vive |
|---|---|
| Secuencial / paralelo / fallback | `runProviderPipeline` (Paso 14), sin cambios de comportamiento por defecto |
| Límite de concurrencia en paralelo | `runProviderPipeline({ maxConcurrency })` — **nuevo en Paso 15**, aditivo (`null` = sin límite, igual que antes) |
| Prioridad | `ProviderRegistry.setPriority` (Paso 14) + `providerPriorityOverrides` (Paso 15) |
| Timeout global/individual | `runProviderPipeline` (Paso 14), sin cambios |
| Cancelación (`AbortSignal`) | `runProviderPipeline` (Paso 14), sin cambios |
| Aislamiento de errores | Ya garantizado por Paso 14: un proveedor que lanza produce `status:"failed"` sin romper el resto |
| Circuit breaker / salud básica | `providerCircuitBreaker.js` (nuevo) + health gate (`registry.healthCheckAll()`) en el puente |
| Degradación controlada | Confirmado por test: una caída del proveedor real completa la auditoría igualmente (`evidenceConflicts`/scores siguen calculándose) |

### Circuit breaker — diseño y su límite honesto

Cuenta fallos consecutivos (`failed`/`timeout`) por `providerId`. Tras
`failureThreshold` (3 por defecto) fallos seguidos, el proveedor queda
`blocked` y se desactiva ANTES de resolver la cadena en la SIGUIENTE
llamada que comparta el mismo breaker. Un único fallo nunca bloquea nada.

Límite honesto: en una auditoría con un solo lote de URLs, solo hay UNA
llamada a `collect()` por proveedor — el breaker no tiene "varios
intentos" que contar dentro de una misma auditoría. Su valor real aparece
cuando el MISMO breaker se reutiliza entre varias auditorías consecutivas
en el mismo proceso (p. ej. un CLI batch futuro que audite N negocios
seguidos): si el proveedor real está caído, deja de intentarse tras 3
auditorías fallidas seguidas, protegiendo el resto del lote. Está probado
exactamente así (`orchestratorProviderBridge.test.mjs`, "circuit breaker
compartido bloquea... entre llamadas").

### Health gate

Antes de resolver la cadena, se llama a `registry.healthCheckAll()`; todo
proveedor con `healthy:false` se desactiva para esa ejecución.
`publicWebsiteFetcher.healthCheck()` (Paso 13) **nunca hace red** — solo
confirma que el módulo cargó y devuelve un mensaje estático — por lo que
este gate no introduce ninguna llamada de red nueva ni en `--health` ni
en `--plan` del CLI (verificado).

## Estados estructurados por proveedor (Fase 3 del enunciado)

`evidenceAggregator.js` → `mapToOrchestratorStatus` traduce el `status`
interno de `ProviderResult` (Paso 14: `success|partial|failed|
not_implemented|skipped|timeout|cancelled`) al vocabulario pedido:

| ProviderResult.status | orchestratorStatus |
|---|---|
| success / partial | `available` |
| not_implemented | `unavailable` |
| failed | `failed` (o `blocked` si el circuit breaker acaba de abrirse) |
| skipped | `skipped` |
| timeout | `timed_out` |
| cancelled | `cancelled` |

## Operación segura — invariantes verificadas por test

- Sin `--allow-network`, el proveedor real se **desactiva en el registro
  antes de resolver la cadena** (no se invoca y se descarta el resultado
  después) — defensa en profundidad idéntica a Paso 13, ahora también en
  modo multiproveedor.
- `allowNetwork:true` con `request.mode` no compatible (`offline`) sigue
  sin activar red — el modo del request manda, igual que Paso 13.
- `--dry-run` nunca ejecuta el pipeline multiproveedor con red real (se
  hereda de `runResearchAudit`, sin tocar esa comprobación).
- `research:providers --list|--describe|--health|--plan` nunca tocan la
  red, ni siquiera con proveedores reales registrados (el `healthCheck()`
  real es estático).
