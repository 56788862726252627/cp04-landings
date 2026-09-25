# 01 — Auditoría y diseño

## Qué se reutilizó de Paso 09/10/11 (sin duplicar)

- **Sectores**: `SECTOR_PRESET_IDS` de `nl-builder/sectorLexicon.js` (Paso 11)
  — `sectorAuditPresets.js` importa esos mismos 10 ids, nunca inventa una
  taxonomía nueva.
- **Automatizaciones**: `AUTOMATION_CATALOG` de `nl-builder/automationCatalog.js`
  (Paso 11) — `researchAutomationCatalog.js` solo AÑADE las 6 automatizaciones
  que el enunciado de Paso 12 pide y que no existían (ticket de soporte,
  reporting, sincronización, consentimiento, campañas, contenido).
- **Puntos de extensión**: `factory/extensionPoints.js` (Paso 10) ya tenía
  3 entradas de investigación (`publicResearch`, `googleMaps`,
  `websiteAudit`). Se enriquecieron sus `docsNote` y se añadieron 12 más
  (bajo la misma fábrica `defineExtensionPoint`/`buildMockImplementation`
  ya existente, sin reescribirla) para cubrir los 13 contratos futuros del
  enunciado (fetcher real, buscador, mapas, directorios, social, reseñas,
  Lighthouse, accesibilidad, SEO, fingerprinting, IA compatible con
  OpenAI/Perplexity/modelo local).
- **Validación de Business Intent/Blueprint**: `intentEnrichment.js` y
  `blueprintEnrichment.js` reutilizan `validateBusinessIntent` /
  `validateBusinessBlueprint` tal cual — nunca reimplementan su propia
  validación.
- **CLI**: `parseCliArgs` de `tenant-cli/lib/tenantProvisioning.mjs`
  (Paso 09), igual que hacen `factory-cli` y `nl-builder`.
- **`slugify`**: reutilizado de `tenant-cli/lib/tenantProvisioning.mjs`
  para el `auditId`, en vez de reimplementar otro slugificador.

## Componentes nuevos, incompletos o no aplicables

| Componente | Estado |
|---|---|
| Motor determinista offline (13 adaptadores + 45 dimensiones + scoring) | Completo y probado |
| Política de seguridad (SSRF/rutas/allowlist/denylist) | Completa y probada |
| Comparación de competidores | Completa (offline, requiere fixtures explícitas) |
| Enriquecimiento de Intent/Blueprint | Completo (propuesta + `--apply` a archivo nuevo) |
| Conexión real a cualquier proveedor externo | **No implementada** — solo contrato (ver 03 y `factory/extensionPoints.js`) |
| Captura real de mockups/PDF | **No implementada** — depende de Playwright, no es dependencia de este paso |

## Riesgos de duplicación detectados y evitados

- Se decidió **no** reescribir el catálogo de automatizaciones de Paso 11:
  `researchAutomationCatalog.js` solo declara la diferencia (6 nuevas) y
  reexporta un catálogo combinado.
- Se decidió **no** crear una segunda taxonomía de sectores.
- Se decidió reutilizar `defineExtensionPoint` en `factory/extensionPoints.js`
  en vez de crear un segundo registro de contratos paralelo — los 13
  contratos futuros de investigación viven en el MISMO archivo que los de
  Paso 10, con el mismo mecanismo de mock/estado.

## Arquitectura propuesta (y construida)

```
Research Request ──▶ evaluatePolicy ──▶ buildResearchPlan
        │                                      │
        ▼                                      ▼
  collectEvidence (13 adaptadores offline) ──▶ deduplicateEvidence
        │
        ▼
  evaluateAllDimensions (45) ──▶ computeAllScores (13 categorías + global)
        │
        ▼
  buildRecommendations ──▶ recommendAutomationsFromFindings ──▶ compareCompetitors
        │
        ▼
  buildReportData ──▶ 9 renderers Markdown + audit.json ──▶ persistAuditFiles (idempotente)
```

Cada flecha es una función pura (excepto la recolección, que solo lee
archivos locales/fixtures) — ver `auditOrchestrator.js` para la
orquestación completa y `docs/.../02` en adelante para cada pieza.

## Criterios verificables de finalización

Ver la sección 18 (criterios de aceptación) del enunciado, reproducidos y
verificados uno a uno en [11-calidad-seguridad-regresion.md](./11-calidad-seguridad-regresion.md).
