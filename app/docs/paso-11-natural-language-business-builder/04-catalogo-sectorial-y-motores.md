# 04 — Catálogo sectorial y motores de módulos/roles/automatizaciones

## Catálogo sectorial (`sectorLexicon.js`)

10 presets de **interpretación** (distintos de los presets/plantillas de *construcción*
de Paso 09): `padel-sports`, `dental`, `physiotherapy`, `veterinary`, `hair-beauty`
(con variante `beauty`), `law`, `restaurant`, `education`, `automotive`, `real-estate`.
Cada uno declara: `keywords`, `actors`, `entities`, `recommendedModules`, `roles`,
`processes`, `automationHints`, `metrics`, `risks`, `optionalIntegrations`,
`terminologyOverrides`, `doNotAutoAdd`. Fallback: `GENERIC_SECTOR_PRESET` cuando ninguna
keyword coincide (confianza de sector baja, visible en `confidence.bySection.sector`).

`matchSectorPreset(textoNormalizado)` puntúa por número de coincidencias de keyword;
empates los gana el primer preset declarado (determinista). Las 4 sectores sin
preset/plantilla propios en Paso 09 (`restaurant`, `education`, `automotive`,
`real-estate`) se añadieron a `KNOWN_SECTORS` de `tenantSchema.js` en este mismo paso
(ver 01) porque el bridge de Paso 10 ya sabe hacer fallback seguro a la plantilla
`local-service`.

## Motor de módulos y dependencias (`moduleCatalog.js` + `moduleDependencyEngine.js`)

34 módulos candidatos con `keywords`, `dependsOn` y dos flags especiales:
`requiresReinforcedPermissions` (expedientes) y `requiresExplicitMention` (inventario).
`resolveModules(texto, preset)` aplica, en este orden:

1. Detección de módulos **explícitos** (keyword match directo).
2. Módulos **base** (`autenticacion`, `clientes`, `soporte`, `configuracion`) siempre presentes.
3. Módulos **recomendados** por el preset sectorial.
4. Módulos de **upsell** (`informes`, `dashboard`, `crm`, `leads`, `notificaciones`,
   `membresias`, `consentimientos`, `backups`, `auditoria`, `contenidos`) → `suggested`,
   nunca `enabled` automáticamente, salvo que el sector los excluya explícitamente
   (`doNotAutoAdd`).
5. Resolución de dependencias en 2 pasadas (cubre cadenas como `ranking→torneos`):
   `citas` exige `recursos` o `profesionales`; `pagos` exige `servicios`; etc.
6. Salvaguardas literales del enunciado: `inventario` **nunca** se activa sin mención
   explícita; un módulo fuera de `recommendedModules` y no pedido explícitamente pasa a
   `rejected` (nunca se activa en silencio); si se pide explícitamente, se acepta con
   `confidence ≤ 0.5` y una justificación que dice "fuera de lo habitual".

Salida siempre en el mismo orden (el de declaración en `MODULE_CATALOG`), nunca en el
orden en que el texto los menciona — así la salida es determinista independientemente
de cómo esté redactada la frase.

## Roles y permisos (`roleEngine.js`)

Los roles de cada negocio son, literalmente, los que declara el preset sectorial
(`sectorPreset.roles`) — no se inventan roles nuevos por petición. Lo que aporta este
motor es la **matriz de permisos**: cada rol conocido (`jugador`, `paciente`,
`recepcion`, `dentista`, `direccion`, `soporte`, …) se clasifica en un tier fijo
(`client`, `reception`, `professional`, `admin`, `support`) y cada tier tiene un
conjunto de módulos permitidos, con mínimo privilegio explícito:

- `client`: solo `citas`, `servicios`, `documentos`, `pwa`, `landing`.
- `reception`/`professional`: acceso operativo, nunca a módulos con
  `requiresReinforcedPermissions` (expedientes) salvo `professional`/`admin`.
- `support`: solo `soporte`, `incidencias`, `notificaciones`, `auditoria`.
- `admin` (`direccion`/`administracion`): todos los módulos habilitados del negocio.

Un rol desconocido (no debería ocurrir, pero nunca debe romper el pipeline) cae a
`reception` por seguridad.

## Automatizaciones (`automationCatalog.js`)

13 automatizaciones de ejemplo, cada una atada a una capacidad genérica ya existente en
`automations/capabilityMap.js` (nunca inventa capacidades nuevas). Cada entrada declara
`trigger`, `conditions`, `actions`, `dataNeeded`, `errorHandling`, `idempotency`, `logs`,
`priority`, `qualitativeROI`, `recommendedImplementation` (`backend | worker | serverless
| make | manual`), `futureIntegration`, `testData`, `requiredModules`.
`recommendAutomations(módulos, preset)` filtra por `automationHints` del sector +
módulos requeridos ya habilitados/sugeridos, deduplica por id y ordena por prioridad
(determinista). Ninguna llamada real a Make/Airtable/Stripe/WhatsApp.

## Tests

`moduleDependencyEngine.test.mjs` (11), `roleEngine.test.mjs` (8),
`automationCatalog.test.mjs`, `sectorLexicon.test.mjs` cubren, con datos concretos, cada
regla anterior (no solo `assert(true)`): inventario nunca en silencio, expedientes nunca
para recepción/cliente, dirección con acceso total, orden determinista, etc.
