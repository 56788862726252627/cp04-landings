# 02 — Research Request schema

`src/saas-core/research/researchRequestSchema.js` — versionado
(`RESEARCH_REQUEST_SCHEMA_VERSION = 1`), validación fail-closed
(`validateResearchRequest` nunca lanza, siempre `{valid, errors}`), mismo
patrón que `businessIntentSchema.js`/`businessBlueprintSchema.js`.

## Campos principales

`schemaVersion, requestId (determinista, hash de business+inputs+seed),
mode (offline|online), language, locale, country, timezone, seed, business
{name, sector, subsector, location, domains, aliases}, inputs {urls,
localFiles, snapshots, fixtures, businessIntent, businessBlueprint,
competitors}, objectives, requestedDimensions, excludedDimensions,
sourcePolicy {allowDomains, denyDomains}, crawlPolicy, privacyPolicy,
limits {maxSources, maxDepth, maxContentLength, timeoutMs,
rateLimitPerMinute}, expectedOutputs, metadata`.

## Determinismo

`requestId` se calcula con `computeRequestId({business, inputs, seed})` —
un hash sha256 truncado del contenido relevante, **nunca** de un
timestamp. Dos requests con el mismo `business`+`inputs`+`seed` producen
siempre el mismo `requestId`.

## Validación estricta y mensajes útiles

- Rechaza propiedades de nivel superior desconocidas.
- Rechaza `mode` fuera de `["offline","online"]`.
- Rechaza `limits.*` no numéricos o ≤0.
- Detecta cualquier secreto/credencial embebido (`SECRET_LOOKALIKE`) en
  cualquier parte del request y lo rechaza.
- Cada error trae `{path, message}` — nunca un booleano desnudo.

## Migración de versiones

`migrateResearchRequest(raw)` — un request "legacy" sin `schemaVersion` se
migra asignándole la versión actual sin más cambios; lanza si la versión
es desconocida y no hay ruta de migración.

## `buildResearchRequest(partial)`

Constructor con defaults seguros: `mode: "offline"` por defecto,
`limits` conservadores, `requestId` autocalculado si no se indica. Es lo
que usa internamente `research-cli/lib/researchCli.mjs` para construir un
request desde flags de CLI o `--demo=<id>`.

Ejemplos válidos e inválidos: ver
`researchRequestSchema.test.mjs` (11 tests) — cubre construcción,
determinismo del id, campos obligatorios, `mode` inválido, propiedades
desconocidas, secretos embebidos, límites inválidos, `assertValidResearchRequest`
y migración.
