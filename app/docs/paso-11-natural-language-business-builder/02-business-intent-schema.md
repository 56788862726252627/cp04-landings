# 02 — Business Intent: schema, validación, migración

Código: `app/src/saas-core/nl-builder/businessIntentSchema.js` (+ `businessIntentExamples.js`, `businessIntentSchema.test.mjs`).

## Por qué existe un descriptor separado del Business Blueprint

El **Business Blueprint** (Paso 10) es lo que la fábrica sabe construir: campos
finales, sin ambigüedad, listos para `business:create`. El **Business Intent** es lo
que el sistema *entendió* de una petición humana, con toda su incertidumbre todavía
visible: qué se pidió explícitamente, qué se infirió, qué se rechazó, qué ambigüedades
quedan, cuánta confianza hay en cada sección. Un Intent nunca se usa directamente para
generar un tenant: siempre pasa por `blueprintComposer.js`, que lo proyecta a un
Blueprint válido.

## Campos de nivel superior

`schemaVersion`, `requestId`, `language`, `locale`, `country`, `currency`, `timezone`,
`business` (`proposedName`, `sector`, `subsector?`, `businessModel?`, `targetAudience?`,
`locations?`, `channels?`), `objectives`, `problemsToSolve`, `actors`, `processes`,
`entities`, `requestedFeatures`, `inferredFeatures`, `rejectedFeatures`, `modules`,
`roles`, `permissions`, `automations`, `integrations`, `branding`, `landing`, `pwa`,
`analytics`, `security`, `complianceNotes`, `nonFunctionalRequirements`, `assumptions`,
`ambiguities`, `recommendedQuestions`, `confidence`, `sourceText`, `normalizedSummary`,
`generationMetadata`. Todos estos nombres están recogidos literalmente en el enunciado
del Paso 11 (sección 4).

Obligatorios: `schemaVersion`, `requestId`, `language`, `locale`, `country`, `currency`,
`timezone`, `business` (con `proposedName` y `sector`), `sourceText`, `confidence`
(con `overall`, número 0-1).

## Validación

`validateBusinessIntent(intent)` → `{valid, errors:[{path, message}]}`. Nunca lanza
(fail-closed, mismo patrón que `businessBlueprintSchema.validateBusinessBlueprint` y
`tenantSchema.validateTenantConfig`): un intent inválido siempre se puede inspeccionar,
nunca provoca una excepción no controlada en el llamador.

Reglas relevantes: `modules[].source` ∈ {explicit, inferred, recommended},
`modules[].status` ∈ {enabled, suggested, deferred, rejected}, `modules[].confidence` y
`confidence.overall`/`confidence.bySection.*` ∈ [0,1], `ambiguities[].blocking` es
boolean, y un escaneo final rechaza cualquier valor que parezca un secreto real
(`sk_live`, `sk_test`, `whsec_`, `AIza`, `xox[baprs]-`) — igual que en Paso 09/10, un
Business Intent nunca contiene credenciales, solo referencias.

`assertValidBusinessIntent(intent)` lanza con un mensaje legible si es inválido (uso en
scripts/CLI que deben fallar rápido).

## Migración de versiones

`migrateBusinessIntent(raw)` → `{intent, migrated, notes}`. Hoy solo existe la versión 1:
un intent sin `schemaVersion` se trata como "legacy" y se le asigna la versión actual sin
más cambios (mismo patrón que `businessBlueprintSchema.migrateBusinessBlueprint`). Un
salto real de v1→v2 en el futuro debe añadir un paso más a esta cadena, nunca reescribir
el actual.

## Ejemplos

`businessIntentExamples.js` exporta `MINIMAL_BUSINESS_INTENT` (solo los campos
obligatorios), `FULL_BUSINESS_INTENT` (todas las secciones rellenas, sector
fisioterapia) e `INVALID_BUSINESS_INTENT_EXAMPLES` (3 casos: campos obligatorios
ausentes, `sector` con tipo incorrecto, `confidence.overall` fuera de rango).

## Tests

`businessIntentSchema.test.mjs` cubre: intent mínimo válido, intent completo válido,
cada uno de los 3 ejemplos inválidos, migración legacy→v1, y el escaneo de secretos.
