# 02 — Plugins: 12 stub + 1 real, descubrimiento automático

`providers/plugins/` contiene 13 módulos, cada uno exportando `PROVIDER`:

| id | status | dimensiones | prioridad | notas |
|---|---|---|---|---|
| `publicWebsiteFetcher` | **real** | `*` | 10 | envuelve `providers/publicWebsiteFetcher.js` (Paso 13), sin reescribirlo |
| `lighthouseProvider` | stub | `performance` | — | futuro Lighthouse/PageSpeed |
| `performanceProvider` | stub | `performance` | 45 | proveedor de rendimiento alternativo (p. ej. WebPageTest) |
| `speedProvider` | stub | `performance` | 46 | Core Web Vitals de campo (tipo CrUX) |
| `seoProvider` | stub | `seoTechnical`, `seoContent`, `seoLocal` | 40 | debe respetar robots.txt cuando se implemente |
| `schemaProvider` | stub | `seoTechnical`, `publicDataConsistency` | 45 | datos estructurados schema.org/JSON-LD |
| `accessibilityProvider` | stub | `accessibility` | 40 | requiere navegador headless |
| `socialProvider` | stub | `socialMediaPresence`, `publicReputation` | 40 | requiere `SOCIAL_PROVIDER_API_KEY` |
| `technologyProvider` | stub | `observableIntegrations`, `digitalMaturitySignal`, `observableAutomation` | 45 | detección pasiva tipo Wappalyzer |
| `securityHeadersProvider` | stub | `observableSecurity` | 40 | cabeceras HTTP observables |
| `dnsProvider` | stub | `observableSecurity`, `digitalMaturitySignal` | 45 | MX/SPF/DMARC/CAA, reutilizaría `urlSafety.js` |
| `whoisProvider` | stub | `trustSignals`, `publicDataConsistency` | 48 | antigüedad de dominio |
| `aiContentProvider` | stub | `contentQuality`, `valueProposition`, `serviceClarity` | — | análisis de contenido vía LLM, validación estricta + fallback (mismo patrón que `aiProviderContract.js` de Paso 11) |

La prioridad `10` de `publicWebsiteFetcher` (frente al `50` por defecto de
los stub) garantiza que, en `resolveFallbackChain("*")` o en cualquier
dimensión, el proveedor real siempre se intenta primero cuando está
habilitado — coherente con `providerPipeline.test.mjs`, que verifica el
orden de la cadena de fallback.

## `publicWebsiteFetcherPlugin.js` — el único wrapper "real"

No reimplementa nada de Paso 13: importa
`PUBLIC_WEBSITE_FETCHER_PROVIDER` de `providers/publicWebsiteFetcher.js`
y traduce su forma (`collect(urls, limits)` → `{ evidence, pageResults,
consultedUrls }`) al contrato `ResearchProvider` (`collect(input) →
ProviderResult`):

- `status: "success"` si todas las URLs quedaron `available`.
- `status: "partial"` si al menos una quedó disponible.
- `status: "failed"` si ninguna lo estuvo.
- `status: "skipped"` si no se declaró ninguna URL.

Sigue exigiendo `allowNetwork: true` en tiempo de ejecución exactamente
igual que en Paso 13 — el wrapper **no** cambia esa regla de seguridad,
solo la forma del contrato. Esto está documentado explícitamente como
limitación declarada del proveedor
(`limitations: ["Requiere allowNetwork:true en tiempo de ejecución..."]`).

## Descubrimiento automático — por qué importa

`plugins.test.mjs` prueba, contra el directorio real (no un fixture),
que `discoverAndRegisterPlugins()` carga los 13 proveedores **sin
listarlos a mano**:

```js
const pluginsDir = path.resolve("src/saas-core/research/providers/plugins");
const { loaded, errors } = await discoverAndRegisterPlugins(registry, pluginsDir);
// loaded.length === 13, errors === []
```

Esto significa que añadir un 14º proveedor (stub o real) en el futuro
consiste en: crear `providers/plugins/nuevoProvider.js` exportando
`PROVIDER` (via `defineStubProvider` o `defineResearchProvider`
directamente) — nada más. Ningún otro archivo del núcleo necesita
cambiar.
