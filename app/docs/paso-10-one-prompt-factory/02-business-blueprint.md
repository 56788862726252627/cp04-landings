# Paso 10 · Fase 2 — Business Blueprint

Código: `app/src/saas-core/factory/businessBlueprintSchema.js` (esquema + validación
+ migración) y `businessBlueprintExamples.js` (ejemplos). Tests:
`businessBlueprintSchema.test.mjs` (15 tests).

## Qué es

Un único objeto JSON versionado (`schemaVersion` actual = 1) que describe un
negocio completo: identidad, sector, branding, plan, módulos, servicios,
profesionales, recursos, horarios, localizaciones, automatizaciones,
capacidades de IA (declarativas), integraciones, PWA, landing, datos demo,
flags, límites, privacidad, pasos manuales y metadatos de generación — los
campos mínimos pedidos por la Fase 2, todos presentes en `TOP_LEVEL_FIELDS`.

## Validación

`validateBusinessBlueprint(blueprint)` nunca lanza: devuelve siempre
`{valid, errors[]}` con `{path, message}` por error (fail-closed, mismo
patrón que `tenantSchema.validateTenantConfig`). Reglas:

- Rechaza cualquier propiedad de nivel superior desconocida.
- Exige los campos obligatorios: `schemaVersion, businessId, tenantId,
  commercialName, sector, country, timezone, locale, currencies, plan`.
- `sector` debe pertenecer a `KNOWN_SECTORS` (reutilizado de `tenantSchema.js`,
  no redefinido).
- `automations` debe ser un subconjunto de `GENERIC_AUTOMATION_CAPABILITIES`
  (reutilizado de `capabilityMap.js`).
- `integrations[...].envVars` nunca puede contener un valor (`KEY=valor`),
  solo el nombre de la variable.
- Escaneo de secretos evidentes (`sk_live`, `sk_test`, `whsec_`, `AIza`,
  `xox[baprs]-`) en **todo** el JSON serializado, no solo en `integrations`.
- `branding.colors.*` debe ser hexadecimal `#rrggbb`.

`assertValidBusinessBlueprint(blueprint)` lanza con el detalle completo —
pensado para CLI/scripts donde fallar rápido es lo seguro.

## Migración de versiones

`migrateBusinessBlueprint(raw)` soporta hoy un único salto: un borrador
"legacy" sin `schemaVersion` (o `schemaVersion: 0`) con `currency` singular
se convierte a v1 con `currencies: [currency]`. Devuelve
`{blueprint, migrated, notes}` y nunca muta la entrada. Una versión futura
(`>1`) añadiría un paso más a esta cadena, sin reescribir los anteriores —
el mismo patrón de `schemaVersion` que ya usa `tenantSchema.js`.

## Ejemplos

- `MINIMAL_BUSINESS_BLUEPRINT`: los 10 campos obligatorios, nada más.
- `FULL_BUSINESS_BLUEPRINT`: la clínica dental demo completa usada en la
  Fase 12 — sector regulado, 3 profesionales, 3 servicios, branding,
  landing, PWA, datos demo con seed fija.
- `LEGACY_BUSINESS_BLUEPRINT_EXAMPLE`: para probar la migración.
- `INVALID_BUSINESS_BLUEPRINT_EXAMPLES`: 5 casos inválidos, uno por tipo de
  error (campos ausentes, sector desconocido, tenantId inválido, secreto
  filtrado, propiedad desconocida) — usados en tests y reutilizables para
  documentación de errores.

## Nunca contiene secretos

Igual que `tenant.config.json`: las integraciones solo declaran
`{status, envVars: ["NOMBRE_VARIABLE"]}`. El escaneo de secretos corre sobre
el blueprint de entrada (aquí) y de nuevo sobre cada archivo generado por el
orquestador (defensa en profundidad, ver `03-orquestador-pipeline.md`).
