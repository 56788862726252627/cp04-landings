# 07 — Recomendaciones y automatizaciones

## Recomendaciones (`recommendationEngine.js`)

Cada dimensión con `score < 70` (y con evidencia real, nunca sobre
"unknown") produce una recomendación con TODOS los campos del enunciado:
`recommendationId, title, category, problem, evidenceIds, impact, effort,
urgency, confidence, priority, dependencies, risks, quickWin,
proposedImplementation, suggestedOwner, kpi, acceptanceCriteria,
automationCandidate, businessIntentMapping, blueprintMapping,
moduleMapping`.

**Fórmula explicable**: `priority = (impact × confidence × urgency) ÷ effort`.

- `impact = (100 - score) / 100` — peor score, más impacto potencial.
- `urgency = 0.9` si la dimensión es prioritaria para el sector (preset),
  si no `0.5`.
- `effort` (1-5) y `proposedImplementation` vienen de un lookup por
  dimensión (`DIMENSION_PROFILES`) con 23 perfiles concretos + un default
  razonable; clasifica en los 12 tipos del enunciado (`contenido, diseño,
  frontend, backend, módulo SaaS, Make, worker, serverless, proceso
  manual, integración externa, formación, revisión profesional`).
- `quickWin = effort ≤ 2 && impact ≥ 0.4`.
- Para sectores regulados y dimensiones sensibles
  (`bookingCapability/serviceClarity/visibleCompliance`), la
  implementación se fuerza a `"revisión profesional"` — nunca se sugiere
  automatizar sin más una decisión que requiere criterio humano/experto.

`buildBacklog()` (alias explícito de orden) y `buildImpactEffortMatrix()`
(4 cuadrantes: quick wins / proyectos mayores / rellenos / cuestionables)
— determinista, empates resueltos por orden alfabético de id.

## Automatizaciones (`researchAutomationCatalog.js`)

**Reutiliza** el catálogo de 13 automatizaciones de Paso 11
(`AUTOMATION_CATALOG`) y solo AÑADE las 6 que pedía el enunciado de Paso
12 y no existían: `ticket_soporte_incidencia, reporting_periodico_kpis,
sincronizacion_datos_externos, registro_consentimiento,
campana_estacional, actualizacion_contenido_programada` — misma forma
completa (trigger/conditions/actions/dataNeeded/errorHandling/
idempotency/logs/priority/qualitativeROI/recommendedImplementation/
requiredModules) que las de Paso 11.

`recommendAutomationsFromFindings(dimensionResults)` mapea dimensiones
problemáticas → automatizaciones candidatas del catálogo COMBINADO (19
en total), sin duplicados semánticos (un id nunca aparece dos veces
aunque varias dimensiones lo sugieran). Ninguna automatización crea un
escenario real de Make ni conecta ninguna API — son propuestas con datos
de prueba (`testData`), nunca ejecuciones.
