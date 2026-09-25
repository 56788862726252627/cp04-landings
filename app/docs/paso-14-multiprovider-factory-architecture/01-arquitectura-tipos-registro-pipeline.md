# 01 — Arquitectura: tipos, registro y pipeline

## El contrato `ResearchProvider` (`core/providerTypes.js`)

Todo proveedor — real o stub — se define con `defineResearchProvider(def)`,
que valida y congela (`Object.freeze`) la forma completa:

```js
{
  id, version, status,          // status: "real" | "stub" | "disabled"
  capabilities,                 // { dimensions: [...ids o "*"], categories: [...] }
  priority,                     // menor número = mayor prioridad (convención Unix nice), default 50
  credentialsNeeded, limitations,
  enabledByDefault,
  collect(input, options),      // obligatorio
  healthCheck(),                // opcional; si se omite, se deriva de `status`
}
```

`collect()` siempre devuelve un `ProviderResult` uniforme
(`defineProviderResult`), con `status` restringido a un enum explícito
(`success | partial | failed | not_implemented | skipped | timeout |
cancelled`) — un `status` fuera de ese enum lanza en el momento de
construir el resultado, no silenciosamente más tarde.

`capabilities.dimensions` referencia los ids del registro de 45
dimensiones de Paso 12 (`dimensionRegistry.js`), o `"*"` para "cualquiera"
— el mismo convenio que ya usaban los 13 adaptadores offline de
`sourceAdapters.js`. `plugins.test.mjs` valida que ningún stub declare una
dimensión inexistente.

## `defineStubProvider` — fábrica compartida de los 12 stubs

Los 12 proveedores stub (Fase 3, ver [documento 02](./02-plugins-stub-y-proveedor-real-descubrimiento-automatico.md))
comparten exactamente la misma forma: nunca hacen red, siempre devuelven
`status: "not_implemented"` con una evidencia placeholder por dimensión
declarada (`defineProviderEvidencePlaceholder`). `defineStubProvider({...})`
evita duplicar ese boilerplate en 12 archivos — cada plugin stub solo
declara `id`, `label`, `capabilities`, `priority` y `limitations`.

## `ProviderRegistry` (`core/providerRegistry.js`)

Registro en memoria (`Map`) con:

- `register(provider)` / `unregister(id)` — rechaza duplicados por `id`.
- `setEnabled(id, bool)` / `setPriority(id, n)`.
- `list({ onlyEnabled })` — ordenado por prioridad ascendente, luego `id`.
- `resolveFallbackChain(dimension)` — proveedores habilitados que cubren
  esa dimensión (o `"*"`), ordenados por prioridad. Es la base de
  cualquier estrategia de fallback: se usa junto a `runProviderPipeline`.
- `healthCheckAll()` — ejecuta `healthCheck()` de todos los proveedores
  registrados; un `healthCheck()` que lanza no rompe el resto (se captura
  por proveedor).

### `discoverAndRegisterPlugins(registry, pluginsDir)`

Descubrimiento automático: escanea `pluginsDir` en busca de módulos `.js`
(nunca `.test.mjs`) que exporten `PROVIDER`, los importa dinámicamente
(`import(pathToFileURL(...))`) y los registra. **Añadir un proveedor nuevo
no requiere tocar `providerRegistry.js`** — basta con crear un archivo en
`providers/plugins/` que exporte un `ResearchProvider` válido. Un plugin
corrupto o inválido se reporta en `errors` sin romper la carga del resto
(aislamiento de fallos por plugin).

## `runProviderPipeline` (`core/providerPipeline.js`)

Orquesta una cadena de proveedores ya resuelta (típicamente el resultado
de `registry.resolveFallbackChain(dimension)`), en tres modos:

| modo | comportamiento |
|---|---|
| `sequential` | ejecuta todos, en orden, sin detenerse en el primer éxito |
| `parallel` | ejecuta todos a la vez (`Promise.all`) |
| `fallback` (por defecto) | se detiene en el primer `success`/`partial` |

Soporta:

- **Timeout individual** (`individualTimeoutMs`) por proveedor, vía
  `Promise.race` — si expira, el resultado de ese proveedor se marca
  `status: "timeout"` y el pipeline continúa con el siguiente (en modo
  `fallback`/`sequential`).
- **Timeout global** (`globalTimeoutMs`) — aborta toda la cadena.
- **Cancelación externa** (`externalSignal: AbortSignal`) — si ya está
  abortada antes de empezar un proveedor, ese proveedor ni se invoca
  (`status: "cancelled"`).

El pipeline es agnóstico de Evidence/Dimensiones — solo conoce
`ProviderResult`. No sabe nada de `auditOrchestrator.js` ni de
`evidenceSchema.js`.

## Por qué la separación en 3 archivos (y no un solo módulo)

- `providerTypes.js` no importa nada de `node:fs` ni hace I/O — es puro,
  testeable sin mocks de sistema de archivos.
- `providerRegistry.js` es la única pieza con I/O (descubrimiento de
  plugins vía `readdir`/`import()` dinámico).
- `providerPipeline.js` no conoce el registro — recibe una lista de
  proveedores ya resuelta, lo que permite testearlo con proveedores falsos
  sin pasar por el sistema de archivos ni por plugins reales.
