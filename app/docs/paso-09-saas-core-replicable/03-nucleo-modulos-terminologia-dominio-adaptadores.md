# Paso 09 · Fase 5-8 y 11 — Núcleo, módulos, terminología, dominio, adaptadores, automatizaciones

Referencia de las piezas de `app/src/saas-core/`. Todo el código citado aquí
tiene tests en el mismo directorio (`*.test.mjs`, `node --test`).

## Esquema de tenant (Fase 3)

`tenant/tenantSchema.js` — objeto de configuración versionado
(`TENANT_SCHEMA_VERSION = 1`). `validateTenantConfig(config)` nunca lanza:
devuelve `{valid, errors[]}`. Rechaza propiedades desconocidas, tipos
incorrectos, y cualquier cadena con pinta de secreto (`sk_live_`, `whsec_`,
etc.) en cualquier parte del árbol. `tenant/defaultTenant.js` define
`CLUB_PADEL_04_TENANT`, copia literal de `CP04_ROLE_PERMISSIONS` de
`src/utils/rbac.js` — es el único tenant que usa el espacio de ids legacy
de CP04 en vez del catálogo genérico.

## Terminología dinámica (Fase 5)

`terminology/terminology.js` — 7 claves semánticas estables: `customer`,
`resource`, `appointment`, `staff`, `event`, `progress`, `organization`.
`buildTerminology(overrides)` combina la base (pádel) con overrides
parciales por clave, ignorando (sin lanzar) claves inválidas.
`findLeakedSportsTerms(sector, dictionary)` detecta si vocabulario de pádel
se ha filtrado a un sector no deportivo — usado en los tests de plantillas,
presets y tenants demo.

## Módulos y navegación configurables (Fase 6)

`modules/moduleRegistry.js` — `CORE_MODULE_CATALOG` (19 módulos:
inicio, agenda, citas, clientes, profesionales, servicios, recursos,
pagos, automatizaciones, campañas, documentos, formularios, soporte,
informes, configuración, torneos, ranking, control_acceso,
centro_tecnico), cada uno con `status` (`prepared` si existe una
implementación real para al menos un tenant, `pending` si es solo
configuración) y `defaultRoleTiers` (qué roles genéricos lo ven si está
activo). `deriveGenericRolePermissions(enabledModuleIds)` es la ÚNICA
fuente de verdad de jerarquía de roles: las plantillas nunca escriben
permisos a mano.

Motor de acceso: `isModuleEnabled`, `canAccessModule`,
`assertRouteAllowed(tenant, role, moduleId)` (guard fail-closed: sin
tenant, módulo desactivado o rol sin permiso → `{allowed: false, reason}`),
`buildSidebarNavigation(tenant, role)`.

**Equivalencia verificada con CP04**: `moduleRegistry.test.mjs` prueba que
`getEnabledSectionsForRole(CLUB_PADEL_04_TENANT, rol)` es **exactamente
igual**, elemento a elemento, a `CP04_ROLE_PERMISSIONS[rol]` de
`rbac.js`, para los 4 roles reales. Esto es evidencia objetiva, no una
afirmación: el test importa `rbac.js` directamente.

## Modelo de dominio genérico (Fase 7)

`domain/genericDomain.js` — 12 entidades con factories puras (`createCustomer`,
`createStaffMember`, `createService`, `createResource`, `createAppointment`,
`createLocation`, `createCommunication`, `createPaymentIntent`,
`createAutomation`, `createFormDefinition`, `createDocumentReference`,
`createAuditEvent`). Adaptadores CP04 (`playerToCustomer`,
`staffToStaffMember`, `courtToResource`, `reservationToAppointment` y sus
inversos) se testean contra los datos reales de
`src/data/cp04DemoData.js` con pruebas de ida y vuelta (round-trip): no son
transformaciones inventadas, son las formas reales que ya usa el club.

## Adaptadores de proveedores (Fase 8)

`adapters/providerAdapters.js` — 8 interfaces (`DataRepository`,
`AutomationProvider`, `PaymentProvider`, `MessagingProvider`,
`EmailProvider`, `CalendarProvider`, `FileStorageProvider`,
`AnalyticsProvider`) definidas como listas de métodos requeridos, más 8
implementaciones **mock** en memoria (sin red). `FUTURE_PROVIDER_IMPLEMENTATIONS`
documenta qué vendor real implementaría cada interfaz (Airtable/Supabase →
DataRepository, Make → AutomationProvider, Stripe → PaymentProvider,
WhatsApp Business → MessagingProvider, Gmail → EmailProvider, Google
Calendar → CalendarProvider) — todas con `status: "not_implemented"`.
Ningún estado se marca como `connected` en este paso.

## Capacidades de automatización (Fase 11)

`automations/capabilityMap.js` — 17 capacidades genéricas (alta_cliente,
baja_cliente, confirmacion, cancelacion, recordatorio, seguimiento, pago,
impago, encuesta, recuperacion, campana, documento, alerta, backup,
auditoria, soporte, fidelizacion), cada una con un proveedor recomendado
(`CAPABILITY_PROVIDER_HINT`). **La matriz de 50 flujos de Make de Club
Pádel 04 (`src/data/makeInventory.js`) no se toca**: un test
(`capabilityMap.test.mjs`) importa `MAKE_INVENTORY` y verifica que sigue
teniendo exactamente 50 entradas. Las plantillas solo recomiendan
capacidades — ninguna se marca como conectada (`describeCapability(...).connected === false` siempre).

## Plantillas y presets (Fase 4)

`templates/templates.js` (7 plantillas base) y `templates/presets.js` (8
presets). Un preset **hereda literalmente** `modules`/`permissions` de su
plantilla base (test `preset.modules === base.modules` por referencia) y
solo sobrescribe terminología, servicios típicos, campos opcionales,
recomendaciones y el flag `policies.regulatedSector`. Ninguna plantilla
activa `centro_tecnico` (interno de agencia, no de cliente).

| Preset | Plantilla base | Sector regulado |
|---|---|---|
| dental-clinic | healthcare-clinic | sí |
| physiotherapy-clinic | healthcare-clinic | sí |
| speech-therapy | healthcare-clinic | sí |
| psychology-practice | healthcare-clinic | sí |
| law-firm | professional-services | sí |
| fertility-clinic | healthcare-clinic | sí |
| hair-salon | beauty-salon | no |
| veterinarian | veterinary-clinic | sí |
