# Paso 16 — SEO Provider real + auditoría multiproveedor con dos fuentes reales

Convierte `seoProviderPlugin.js` (stub desde Paso 14) en el **segundo
proveedor real** del sistema multiproveedor (Paso 14/15), tras
`publicWebsiteFetcher` (Paso 13). Analiza **únicamente** contenido HTML
ya recopilado de forma autorizada (por `publicWebsiteFetcher`, una
fixture o un archivo local) — nunca descarga nada por su cuenta, nunca
usa una API comercial, un navegador automatizado ni ejecuta JavaScript
remoto.

## Documentos

1. [01 — Arquitectura: contrato, relación con publicWebsiteFetcher, reglas A-H, cómo añadir una regla nueva](./01-arquitectura-seo-provider.md)
2. [02 — Scoring SEO: desglose, cobertura, confianza](./02-scoring-cobertura-confianza.md)
3. [03 — Perfiles sectoriales, privacidad y consentimiento](./03-perfiles-privacidad-consentimiento.md)
4. [04 — CLI y ejemplos](./04-cli-ejemplos.md)
5. [05 — Informe técnico del Paso 16](./05-informe-tecnico-paso-16.md)
6. [06 — Actualización del roadmap maestro vivo (21 pasos)](./06-actualizacion-roadmap-maestro-21-pasos.md)

## Regla de oro de este paso

Con `pipeline: "legacy"` (por defecto), **nada cambia** respecto a Paso
15. `seoProvider` solo actúa cuando se pide `pipeline: "multiprovider"` Y
`publicWebsiteFetcher` produjo páginas reales en la MISMA ejecución — sin
eso, `seoProvider` se marca `"skipped"` (o ni se intenta), nunca inventa
evidencia.

## Código nuevo

```
src/saas-core/research/
├── evidenceSchema.js                      (modificado: + sourceType "seo_analysis_derived", aditivo)
├── auditOrchestrator.js                   (modificado: + reports/seo.md condicional)
├── auditReportGenerator.js                (modificado: + renderSeoReportMarkdown)
├── auditOrchestrator.seo.test.mjs         (nuevo — E2E completo)
└── providers/
    ├── publicWebsiteFetcher.js            (modificado: + headers/robotsTxt reexpuestos, sin segunda descarga)
    ├── orchestratorProviderBridge.js      (modificado: + paso explícito seoProvider tras publicWebsiteFetcher)
    ├── plugins/
    │   ├── publicWebsiteFetcherPlugin.js  (modificado: + metadata.pages)
    │   └── seoProviderPlugin.js           (REESCRITO: stub -> real)
    └── seo/
        ├── seoHtmlExtractors.js           (+ .test.mjs) — extracción HTML pura
        ├── seoAnalyzer.js                 (+ .test.mjs) — 8 categorías A-H
        ├── seoEvidence.js                 (+ .test.mjs) — finding -> Evidence
        ├── seoScoring.js                  (+ .test.mjs) — desglose de scoring
        ├── seoRecommendations.js          (+ .test.mjs) — recomendaciones
        └── seoSectorRules.js              — reglas por perfil (dato puro)

research-cli/
├── lib/researchCli.mjs         (modificado: + --seo/--seo-only/--include-seo/--exclude-seo)
├── research-audit.mjs          (modificado: + --explain-score/--show-coverage)
└── research-seo.mjs            (nuevo)
```
