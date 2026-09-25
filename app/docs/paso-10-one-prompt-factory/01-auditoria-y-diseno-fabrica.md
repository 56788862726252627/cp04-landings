# Paso 10 · Fase 1 — Auditoría y diseño de la fábrica

## Qué existía en Paso 09 (auditado antes de escribir código nuevo)

| Componente | Estado al empezar Paso 10 | Reutilizado en Paso 10 |
|---|---|---|
| `tenant/tenantSchema.js` (validación de tenant) | Completo, 304 tests | Sí, tal cual — `blueprintToTenant.js` produce configs que validan contra el mismo esquema |
| `templates/templates.js` (7 plantillas) | Completo | Sí, tal cual |
| `templates/presets.js` (8 presets) | Completo | Sí, tal cual |
| `modules/moduleRegistry.js` (catálogo + navegación) | Completo, verificado contra `rbac.js` | Sí, tal cual (`buildNavigationPreview`) |
| `terminology/terminology.js` | Completo | Sí, tal cual |
| `domain/genericDomain.js` (entidades genéricas) | Completo | Sí — base de `demoDataGenerator.js` |
| `adapters/providerAdapters.js` (mocks de proveedor) | Completo | Referenciado como patrón para `extensionPoints.js` (Fase 13) |
| `automations/capabilityMap.js` | Completo | Sí, tal cual (validación de `blueprint.automations`) |
| `security/privacyChecklist.js` | Completo | Sí, tal cual (`buildRegulatoryNotice` en docs generados) |
| `tenant-cli/` (`tenant:create/validate/list/preview`) | Completo, 4 archivos por tenant | Su `parseCliArgs` se reutiliza; el resto NO se duplica — la fábrica tiene su propio flujo porque el Blueprint es un superconjunto |
| `tenants/demo/clinica-dental-sonrisas-malaga/` | Existía ya (config ligera, **sin** registros de datos demo reales) | No se toca ni se sustituye — la fábrica genera su propio negocio dental en `businesses/`, sin colisionar |

## Qué faltaba (y por qué es el contenido de este paso)

- **Un descriptor único de negocio.** `tenant.config.json` describe el tenant, pero no branding completo, landing, datos demo reales, PWA, ni metadatos de generación en un solo objeto de entrada. → Fase 2 (Business Blueprint).
- **Un orquestador.** Paso 09 generaba 4 archivos con lógica secuencial simple; no había pipeline con dry-run, idempotencia verificable, ni distinción generado/mantenido. → Fase 3.
- **Datos demo reales.** `demoData` en Paso 09 era solo `{enabled, source}` — ningún registro. → Fase 7 (`demoDataGenerator.js`, con PRNG determinista).
- **Landing page.** No existía ningún generador de landing; el `index.html` de la app principal es específico de Club Pádel 04 y no se toca. → Fase 5, con un renderer único y reutilizable.
- **Motor de branding.** Solo existía `branding.colors` como campo de esquema; sin tokens, sin contraste, sin contrato de iconos/PWA. → Fase 6.
- **Mockups.** No existía ninguna infraestructura de vistas/viewport. → Fase 8 (manifest determinista, sin dependencia nueva).
- **CLI de negocio.** `tenant-cli` no cubre blueprint/landing/branding/informe. → Fase 11 (`factory-cli/`, comparte `parseCliArgs`).

## Riesgos de duplicación identificados y cómo se evitaron

1. **Riesgo**: reimplementar validación de tenant. **Mitigación**: `blueprintToTenant.js` llama a `validateTenantConfig` de Paso 09, nunca reescribe reglas de tenant.
2. **Riesgo**: escribir en `tenants/demo/` y colisionar con los 7 tenants de Paso 09. **Mitigación**: toda la salida de la fábrica vive en `saas-core/businesses/`, un directorio nuevo y separado.
3. **Riesgo**: duplicar el catálogo de módulos/roles por sector. **Mitigación**: el Blueprint solo referencia sector; la resolución de plantilla/preset y permisos sigue siendo 100% de Paso 09.
4. **Riesgo**: lógica de landing/branding específica de un sector dentro del núcleo. **Mitigación**: un único renderer de landing y un único motor de tokens de branding sirven a cualquier sector; solo el *contenido* (Business Blueprint) cambia por negocio.

## Límites actuales (heredados de Paso 09 y honestos sobre este paso)

- Igual que Paso 09: ningún proveedor real conectado, sin integración en vivo con `App.jsx`, sin base de datos por tenant.
- Nuevo en este paso: los binarios de branding/PWA (favicon.ico, PNGs de icono, manifest.webmanifest real) **no se generan**; solo su contrato (`brandingEngine.js`) y fixtures. Las capturas de mockup tampoco se generan (requeriría Playwright, no añadido como dependencia).
- Los datos demo, aunque ahora son registros reales (no solo conteos), siguen siendo sintéticos y deterministas por seed — no sustituyen datos de un cliente real.

## Arquitectura propuesta (implementada)

```
app/src/saas-core/factory/
├── businessBlueprintSchema.js   # Fase 2: esquema + validación + migración
├── businessBlueprintExamples.js # Fase 2: ejemplos válidos/inválidos (incluye clínica dental)
├── blueprintToTenant.js         # Fase 4: puente blueprint -> tenant.config.json (reutiliza Paso 09)
├── brandingEngine.js            # Fase 6: tokens + contraste WCAG + contrato de binarios
├── landingGenerator.js          # Fase 5: config + renderer HTML único y reutilizable
├── demoDataGenerator.js         # Fase 7: dataset sintético reproducible por seed
├── mockupManifest.js            # Fase 8: manifest de vistas/viewport, sin captura real
├── docsGenerator.js             # Fase 9: README/onboarding/checklists etiquetados
├── reportGenerator.js           # Fase 10: informe Markdown + JSON
├── extensionPoints.js           # Fase 13: contratos de integraciones futuras
├── nlToBlueprintContract.js     # Fase 15: contrato instrucción natural -> blueprint (keyword matching, no LLM)
└── orchestrator.js              # Fase 3: pipeline determinista/idempotente

app/factory-cli/
├── lib/businessCli.mjs          # Fase 11: lógica compartida (reutiliza parseCliArgs de tenant-cli)
├── business-create.mjs
├── business-validate.mjs
├── business-preview.mjs
├── business-build.mjs
├── business-report.mjs
├── business-list.mjs
├── business-diff.mjs
└── business-doctor.mjs

app/src/saas-core/businesses/<businessId>/   # salida de la fábrica (nuevo, no colisiona con tenants/demo/)
```

## Criterios verificables de finalización (usados para el informe final)

- [x] Business Blueprint validable con esquema + ejemplos + migración + tests.
- [x] Orquestador funcional, determinista, idempotente, con dry-run/colisiones/manifest.
- [x] CLI real con 8 comandos y tests.
- [x] Clínica dental demo generada dos veces vía CLI, con diff y doctor ejecutados.
- [x] 396/396 tests en verde (304 preexistentes + 92 nuevos), lint y build limpios (mismos preexistentes).
- [x] Ningún archivo del núcleo de Paso 09 ni de la app principal modificado.
