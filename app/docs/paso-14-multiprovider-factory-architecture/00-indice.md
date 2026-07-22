# Paso 14 — Arquitectura de fábrica multiproveedor (`providers/core` + `providers/plugins`)

Generaliza el proveedor real único de Paso 13 (`publicWebsiteFetcher`) en un
sistema que soporta **N proveedores** (reales o stub) bajo un mismo
contrato `ResearchProvider`, con registro, descubrimiento automático de
plugins, resolución de fallback por dimensión, y un pipeline configurable
de ejecución (secuencial / paralelo / fallback).

No modifica ni un carácter del motor de Paso 12 (`dimensionRegistry.js`,
`evidenceSchema.js`, `sourceAdapters.js`) ni del proveedor real de Paso 13
(`providers/publicWebsiteFetcher.js`). Es una capa de abstracción nueva,
aparte.

## Documentos

1. [01 — Arquitectura: tipos, registro y pipeline](./01-arquitectura-tipos-registro-pipeline.md)
2. [02 — Plugins: 12 stub + 1 real, descubrimiento automático](./02-plugins-stub-y-proveedor-real-descubrimiento-automatico.md)
3. [03 — Integración con `research:doctor` y el CLI](./03-integracion-cli-research-doctor.md)
4. [04 — Informe técnico del Paso 14](./04-informe-tecnico-paso-14.md)
5. [05 — Actualización del roadmap maestro vivo](./05-actualizacion-roadmap-maestro.md)

## Ubicación del código

```
src/saas-core/research/providers/
├── core/
│   ├── providerTypes.js          (+ .test.mjs)   — contrato ResearchProvider, fábricas
│   ├── providerRegistry.js       (+ .test.mjs)   — registro + discoverAndRegisterPlugins()
│   └── providerPipeline.js       (+ .test.mjs)   — runProviderPipeline() (sequential/parallel/fallback)
└── plugins/
    ├── publicWebsiteFetcherPlugin.js (+ .test.mjs) — envoltorio del proveedor REAL de Paso 13
    ├── lighthouseProviderPlugin.js
    ├── seoProviderPlugin.js
    ├── performanceProviderPlugin.js
    ├── accessibilityProviderPlugin.js
    ├── socialProviderPlugin.js
    ├── schemaProviderPlugin.js
    ├── technologyProviderPlugin.js
    ├── securityHeadersProviderPlugin.js
    ├── dnsProviderPlugin.js
    ├── whoisProviderPlugin.js
    ├── speedProviderPlugin.js
    ├── aiContentProviderPlugin.js
    └── plugins.test.mjs              — valida los 12 stub + descubrimiento de los 13
```

Reusa íntegramente `publicWebsiteFetcher.js` (Paso 13) — no lo reescribe,
solo lo envuelve en `publicWebsiteFetcherPlugin.js`.

## Alcance explícito (léase antes de asumir integración)

Esta capa **NO sustituye** todavía la llamada directa que
`auditOrchestrator.js` hace a `collectFromPublicWebsite()`
(`providers/publicWebsiteFetcher.js`, Paso 13). El registro y el pipeline
son un sistema completo, probado y usable de forma independiente, pero
`runResearchAudit()` sigue sin pasar por `runProviderPipeline()` — ver
detalle honesto de qué queda pendiente en el
[informe técnico](./04-informe-tecnico-paso-14.md#alcance-y-lo-que-queda-fuera).
