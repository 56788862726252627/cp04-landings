# Paso 18 — Performance Provider real + auditoría multiproveedor con cuatro fuentes reales

Convierte `performanceProviderPlugin.js` (stub desde Paso 14) en el
**cuarto proveedor real** del sistema multiproveedor, tras
`publicWebsiteFetcher` (Paso 13), `seoProvider` (Paso 16) y
`accessibilityProvider` (Paso 17). Analiza **únicamente** datos ya
recopilados de forma autorizada — timing real de la petición, cabeceras
de la respuesta, HTML ya descargado, recursos DECLARADOS en el HTML —
nunca descarga nada por su cuenta, no usa navegador automatizado, no
instala Playwright, no ejecuta JavaScript remoto, no usa Lighthouse ni
PageSpeed Insights ni ninguna API externa, no requiere credenciales.

## Aviso legal/técnico explícito (léase antes de cualquier otra cosa)

**Este proveedor produce una puntuación automática orientativa. NUNCA es
una puntuación de Lighthouse ni de PageSpeed Insights, NUNCA calcula ni
declara Core Web Vitals (LCP/CLS/INP/FCP), y NUNCA sustituye una prueba
de navegador real.** Cada hallazgo declara explícitamente un
`measurementType`: `"observed"` (leído directamente de datos ya
recibidos), `"measured"` (cronometrado con el cliente HTTP de Node
durante la petición real), `"calculated"` (derivado por fórmula
determinista de datos observados/medidos), `"estimated"` (heurística
declarada como tal), `"not_measured"` (deliberadamente no determinable
con esta arquitectura — p. ej. compresión real) o `"unavailable"` (dato
que requeriría descargar algo que este proveedor nunca descarga — p. ej.
peso real de imágenes). Ver
[03 — Límites de medición y honestidad técnica](./03-limites-medicion-honestidad.md).

## Documentos

1. [01 — Arquitectura: contrato, relación con publicWebsiteFetcher/seoProvider/accessibilityProvider, las 10 categorías, diferencias con Lighthouse, cómo añadir una regla nueva](./01-arquitectura-performance-provider.md)
2. [02 — Scoring: desglose de 11 grupos, cobertura, confianza](./02-scoring-cobertura-confianza.md)
3. [03 — Límites de medición y honestidad técnica](./03-limites-medicion-honestidad.md)
4. [04 — Perfiles sectoriales y CLI, con ejemplos](./04-perfiles-cli-ejemplos.md)
5. [05 — Informe técnico del Paso 18](./05-informe-tecnico-paso-18.md)
6. [06 — Actualización del roadmap maestro vivo (21 pasos)](./06-actualizacion-roadmap-maestro-21-pasos.md)

## Regla de oro de este paso

Con `pipeline: "legacy"` (por defecto), **nada cambia** respecto a Paso
17. `performanceProvider` solo actúa cuando se pide
`pipeline: "multiprovider"` Y `publicWebsiteFetcher` produjo páginas
reales en la MISMA ejecución — sin eso, se marca `"skipped"` (o ni se
intenta), nunca inventa evidencia.

## Código nuevo

```
src/saas-core/research/
├── evidenceSchema.js                       (modificado: + sourceType "performance_analysis_derived", aditivo)
├── auditOrchestrator.js                    (modificado: + reports/performance.md condicional)
├── auditReportGenerator.js                 (modificado: + renderPerformanceReportMarkdown)
├── auditOrchestrator.performance.test.mjs  (nuevo — E2E completo con los 4 proveedores reales)
└── providers/
    ├── publicWebsiteFetcher.js             (modificado: + timing real medido, + cabeceras/httpVersion reexpuestos, sin segunda petición)
    ├── orchestratorProviderBridge.js       (modificado: cuarto paso explícito performanceProvider, reutilizando runDerivedPageAnalysisProvider)
    ├── plugins/
    │   ├── performanceProviderPlugin.js    (REESCRITO: stub -> real)
    │   └── publicWebsiteFetcherPlugin.js   (modificado: pages incluye byteSize/httpVersion/timing)
    └── performance/
        ├── perfHtmlExtractors.js  (+ .test.mjs) — extracción HTML específica de rendimiento
        ├── perfAnalyzer.js        (+ .test.mjs) — 10 categorías A-J, measurementType en cada finding
        ├── perfEvidence.js        (+ .test.mjs) — finding -> Evidence
        ├── perfScoring.js         (+ .test.mjs) — desglose de scoring (11 grupos)
        ├── perfRecommendations.js (+ .test.mjs) — recomendaciones (7 severidades)
        └── perfSectorRules.js     — reglas por perfil (dato puro)

research-cli/
├── lib/researchCli.mjs         (modificado: + --performance/--performance-only/--include-performance/--exclude-performance)
├── research-audit.mjs          (modificado: + --explain-performance-score/--show-unmeasured)
└── research-performance.mjs    (nuevo)
```
