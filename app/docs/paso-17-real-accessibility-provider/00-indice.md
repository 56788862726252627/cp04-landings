# Paso 17 — Accessibility Provider real + auditoría multiproveedor con tres fuentes reales

Convierte `accessibilityProviderPlugin.js` (stub desde Paso 14) en el
**tercer proveedor real** del sistema multiproveedor, tras
`publicWebsiteFetcher` (Paso 13) y `seoProvider` (Paso 16). Analiza
**únicamente** HTML, metadatos y estructura ya recopilados de forma
autorizada — nunca descarga nada por su cuenta, no usa navegador
automatizado, no instala Playwright, no ejecuta JavaScript remoto, no usa
APIs externas, no requiere credenciales.

## Aviso legal explícito (léase antes de cualquier otra cosa)

**Este proveedor produce una puntuación automática orientativa. NUNCA
constituye una certificación de accesibilidad, NUNCA declara conformidad
WCAG 2.2 total, y NUNCA sustituye una auditoría de accesibilidad humana
completa con tecnología de asistencia real.** Cada hallazgo declara
explícitamente si es `"automatic"` (afirmable con certeza desde HTML
estático), `"partial"` (indicio razonable, no concluyente) o `"manual"`
(requiere revisión humana obligatoria — este proveedor nunca completa
esa comprobación por sí mismo). Ver
[03 — Revisión manual, privacidad y consentimiento](./03-revision-manual-privacidad.md).

## Documentos

1. [01 — Arquitectura: contrato, relación con publicWebsiteFetcher/seoProvider, las 10 categorías, WCAG 2.2, cómo añadir una regla nueva](./01-arquitectura-accessibility-provider.md)
2. [02 — Scoring: desglose, cobertura, confianza](./02-scoring-cobertura-confianza.md)
3. [03 — Revisión manual, privacidad y consentimiento](./03-revision-manual-privacidad.md)
4. [04 — Perfiles sectoriales y CLI, con ejemplos](./04-perfiles-cli-ejemplos.md)
5. [05 — Informe técnico del Paso 17](./05-informe-tecnico-paso-17.md)
6. [06 — Actualización del roadmap maestro vivo (21 pasos)](./06-actualizacion-roadmap-maestro-21-pasos.md)

## Regla de oro de este paso

Con `pipeline: "legacy"` (por defecto), **nada cambia** respecto a Paso
16. `accessibilityProvider` solo actúa cuando se pide
`pipeline: "multiprovider"` Y `publicWebsiteFetcher` produjo páginas
reales en la MISMA ejecución — sin eso, se marca `"skipped"` (o ni se
intenta), nunca inventa evidencia.

## Código nuevo

```
src/saas-core/research/
├── evidenceSchema.js                       (modificado: + sourceType "accessibility_analysis_derived", aditivo)
├── auditOrchestrator.js                    (modificado: + reports/accessibility.md condicional)
├── auditReportGenerator.js                 (modificado: + renderAccessibilityReportMarkdown)
├── auditOrchestrator.accessibility.test.mjs (nuevo — E2E completo con los 3 proveedores reales)
└── providers/
    ├── orchestratorProviderBridge.js       (modificado: paso explícito generalizado — runDerivedPageAnalysisProvider, reutilizado por seoProvider y accessibilityProvider)
    ├── plugins/
    │   └── accessibilityProviderPlugin.js  (REESCRITO: stub -> real)
    └── accessibility/
        ├── a11yHtmlExtractors.js  (+ .test.mjs) — extracción HTML específica de accesibilidad
        ├── a11yContrast.js        (+ .test.mjs) — cálculo real de contraste WCAG
        ├── a11yAnalyzer.js        (+ .test.mjs) — 10 categorías A-J, mapeo WCAG en cada finding
        ├── a11yEvidence.js        (+ .test.mjs) — finding -> Evidence
        ├── a11yScoring.js         (+ .test.mjs) — desglose de scoring (9 grupos)
        ├── a11yRecommendations.js (+ .test.mjs) — recomendaciones
        └── a11ySectorRules.js     — reglas por perfil (dato puro)

research-cli/
├── lib/researchCli.mjs         (modificado: + --accessibility/--accessibility-only/--wcag-level/...)
├── research-audit.mjs          (modificado: + --explain-accessibility-score/--show-manual-checks)
└── research-accessibility.mjs  (nuevo)
```
