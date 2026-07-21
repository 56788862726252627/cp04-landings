# 01 — Auditoría previa y diseño

## Qué existía en Paso 10 y se reutilizó tal cual (sin duplicar)

| Pieza de Paso 10 | Uso en Paso 11 |
|---|---|
| `businessBlueprintSchema.js` (`validateBusinessBlueprint`, `assertValidBusinessBlueprint`) | El compositor de Paso 11 (`blueprintComposer.js`) produce blueprints y los valida con esta misma función. Ningún blueprint de Paso 11 es "especial". |
| `blueprintToTenant.js` (`blueprintToTenantConfig`, `ENV_VAR_NAMES_BY_PROVIDER`) | Se reutiliza para probar compatibilidad (ver `blueprintComposer.test.mjs`) y para el mapa de nombres de variables de entorno por proveedor (export añadido, ver 00-indice.md). |
| `orchestrator.js` (`runFactoryPipeline`) | `business:from-prompt --execute` lo invoca directamente; ningún nuevo motor de escritura a disco fue creado para materializar negocios. |
| `brandingEngine.js` (`meetsWcagAA`, `contrastRatio`, `ICON_SIZES_PX`, `PENDING_BINARY_ASSETS`) | Reutilizado por `brandingLandingProposal.js` para validar contraste de los acentos sectoriales y referenciar (sin duplicar) el contrato de assets binarios pendientes. |
| `reportGenerator.js` (`buildReportData`, `renderReportMarkdown/Json`) | Reutilizado por `business:from-prompt --execute` para el informe final cuando se materializa el negocio. |
| `tenant-cli/lib/tenantProvisioning.mjs` (`parseCliArgs`, `slugify`) | Reutilizados sin cambios por todo el CLI y el compositor de blueprint (generación de `businessId`/`tenantId`). |
| `nlToBlueprintContract.js` (Paso 10, Fase 15) | Es un stub de extracción por palabras clave, explícitamente documentado como "no es NLU real". Paso 11 NO lo sustituye ni lo borra: implementa un sistema mucho más rico (Business Intent completo, ambigüedades, confianza, roles, automatizaciones) en un módulo nuevo y separado (`nl-builder/`), dejando el stub de Paso 10 intacto como lo que siempre fue: un contrato de referencia. |
| `automations/capabilityMap.js` (`GENERIC_AUTOMATION_CAPABILITIES`) | El catálogo de automatizaciones de Paso 11 (`automationCatalog.js`) usa exclusivamente estas 17 capacidades ya existentes; no inventa ninguna nueva. |

## Qué faltaba (y por qué justifica un paso nuevo, no una extensión trivial)

- Paso 10 recibe un Business Blueprint ya completo y validado: no existía nada que
  interpretara una frase libre y decidiera sector, módulos, roles, automatizaciones,
  branding o ambigüedades. El stub `nlToBlueprintContract.js` cubre ~5 campos con
  keyword-matching simple y declara explícitamente `isRealLanguageUnderstanding: false`.
- No existía un concepto de **incertidumbre visible**: Paso 10 no distingue "esto lo
  dijo el usuario" de "esto lo asumió el sistema". El Business Intent (Fase 2 de este
  paso) existe precisamente para eso.
- No existía un catálogo sectorial de *interpretación* (keywords, actores, roles,
  automatizaciones sugeridas por sector): los presets/plantillas de Paso 09
  (`templates.js`/`presets.js`) describen cómo *construir* un tenant, no cómo
  *entender* una petición en lenguaje natural.

## Riesgos de duplicación identificados y cómo se evitaron

- **Riesgo:** reimplementar validación de blueprint. → Evitado: `blueprintComposer.js`
  importa y usa `validateBusinessBlueprint` de Paso 10 directamente.
- **Riesgo:** un segundo catálogo de módulos con nombres distintos a `moduleRegistry.js`
  de Paso 09. → Aceptado conscientemente y documentado: `moduleCatalog.js` de Paso 11
  describe *candidatos a incluir en `blueprint.modules[]`* (una lista de strings sin
  restricción de catálogo en el esquema), no la navegación ya construida de la app real.
  Se documenta explícitamente en la cabecera de `moduleCatalog.js` para que no se
  confunda con `moduleRegistry.CORE_MODULE_CATALOG`.
- **Riesgo:** reinventar el motor de branding/contraste. → Evitado: `brandingLandingProposal.js`
  importa `meetsWcagAA`/`contrastRatio` de `brandingEngine.js` en vez de recalcular contraste.
- **Riesgo:** un segundo sistema de generación de archivos a disco (paralelo al
  orquestador de Paso 10). → Evitado deliberadamente: Paso 11 solo escribe artefactos de
  *análisis* (`intent.json`, `business.blueprint.json`, informe) en un directorio propio
  (`nl-builder/requests/`); la materialización real de un tenant sigue siendo,
  exclusivamente, `runFactoryPipeline` de Paso 10, invocado sin modificarlo.

## Límites conocidos de esta arquitectura (honestos, no resueltos en este paso)

- `blueprintToTenantConfig` (Paso 10) deriva `tenantConfig.roles`/`permissions` del
  preset/plantilla base (p.ej. `['CLIENT','STAFF','ADMIN','SUPPORT']`), **no** de
  `blueprint.roles`/`blueprint.permissions`. Esto significa que los roles ricos y
  específicos de sector que compone Paso 11 (p.ej. `paciente`/`fisioterapeuta`/`direccion`)
  viajan correctamente en el Blueprint y pasan su validación de esquema, pero el
  tenant.config.json final que ve la aplicación usa la nomenclatura genérica de Paso 09/10
  para los 4 sectores que ya tenían preset/plantilla, o la de `local-service` para los
  4 sectores nuevos (restaurante/academia/taller/inmobiliaria). Es un punto de extensión
  real para un paso futuro (dar a `blueprintToTenantConfig` la opción de respetar
  `blueprint.roles`/`permissions` cuando vienen informados), no algo que este paso
  intentó ocultar ni corregir sin auditar el impacto en Paso 09/10.
- El intérprete determinista es heurístico (keyword/regex), no un modelo de lenguaje:
  frases muy indirectas o sin ninguna palabra clave del léxico sectorial caen al preset
  genérico con confianza baja, visible en `confidence.bySection.sector`.

## Arquitectura implementada (los 10 motores conceptuales del enunciado, mapeados a archivos reales)

| Letra del enunciado | Archivo(s) |
|---|---|
| A. Input normalizer | `inputNormalizer.js` |
| B. Intent extractor | `intentExtractor.js` (orquesta el resto) |
| C. Sector knowledge registry | `sectorLexicon.js` |
| D. Requirement resolver | `moduleDependencyEngine.js` |
| E. Blueprint composer | `blueprintComposer.js` |
| F. Confidence engine | `confidenceEngine.js` |
| G. Ambiguity engine | `ambiguityEngine.js` |
| H. Recommendation engine | `automationCatalog.js` (automatizaciones) + `roleEngine.js` (roles/permisos) |
| I. Explanation engine | `outputSerializer.js` (`renderExplanation`) |
| J. Output serializer | `outputSerializer.js` (JSON/Markdown/summary/diff) |
| Capa B: proveedor de IA | `aiProviderContract.js` |

## Criterios verificables de finalización de esta fase de diseño

- [x] Ningún módulo de Paso 09/10 fue reescrito ni duplicado (solo 3 adiciones puntuales, ver 00-indice.md).
- [x] Cada motor conceptual del enunciado tiene un archivo identificable y testeado.
- [x] El compositor produce blueprints que pasan `validateBusinessBlueprint` sin ningún caso especial.
