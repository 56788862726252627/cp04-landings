# Checkpoint Final — Agencia IA 7/7

**Fecha:** 2026-07-31  
**Sin commit, sin push**

---

## Módulos del núcleo de la agencia (src/saas-core/factory/)

| Archivo | Descripción | Prompt |
|---------|-------------|--------|
| `orchestrator.js` | Pipeline principal de la fábrica | P2/7 |
| `businessBlueprintSchema.js` | Validación del blueprint de negocio | P2/7 |
| `businessBlueprintExamples.js` | Ejemplos (dental, fisio) | P2/7 |
| `blueprintToTenant.js` | Conversión blueprint→tenant config | P2/7 |
| `brandingEngine.js` | Resolución de tokens de branding | P2/7 |
| `landingGenerator.js` | Generación de configuración de landing | P2/7 |
| `extensionPoints.js` | Puntos de extensión (not_implemented) | P2/7 |
| `businessStatusReport.js` | Estado operativo per-negocio | P4/7 |
| `businessStatusReport.test.mjs` | 49 tests | P4/7 |
| `agencyStatusReport.js` | Vista agregada multi-negocio | P5/7 |
| `agencyStatusReport.test.mjs` | 17 tests | P5/7 |
| `agencyService.js` | Service layer puro (validación, filtros, seguridad) | P6/7 |
| `agencyService.test.mjs` | 40 tests | P6/7 |
| `agencyWebhookAdapter.js` | Webhook simulation (dry-run permanente) | P6/7 |
| `agencyWebhookAdapter.test.mjs` | 31 tests | P6/7 |

## CLI (factory-cli/)

| Archivo | Script | Prompt |
|---------|--------|--------|
| `business-create.mjs` | `business:create` | P2/7 |
| `business-status.mjs` | `business:status` | P4/7 |
| `agency-status.mjs` | `agency:status` | P5/7+P6/7 |
| `agency-api.mjs` | `agency:api` | P6/7 |
| `agencyApiRouter.mjs` | (módulo interno) | P6/7 |
| `agencyApiRouter.test.mjs` | 16 tests | P6/7 |
| `lib/businessCli.mjs` | Helpers compartidos | P2/7+P5/7 |

## Adaptadores de integraciones (src/saas-core/commercial/)

| Archivo | Servicio |
|---------|---------|
| `integrationReadiness.js` | Estado de todas las integraciones |
| `airtableAdapter.js` | Airtable (NOT_CONFIGURED por defecto) |
| `stripeAdapter.js` | Stripe (NOT_CONFIGURED por defecto) |
| `whatsappAdapter.js` | WhatsApp (NOT_CONFIGURED por defecto) |
| `driveAdapter.js` | Google Drive (OAuth local configurado, no en producción) |

## Endpoints REST locales (agency:api, localhost:3742)

| Endpoint | Estado |
|----------|--------|
| GET /api/agency/health | ✅ Operativo |
| GET /api/agency/status | ✅ Operativo (filtros: scope, format, sectors, classifications, integrations, summary) |
| GET /api/agency/businesses | ✅ Operativo |
| GET /api/agency/integrations | ✅ Operativo |
| GET /api/agency/sectors | ✅ Operativo (devuelve KNOWN_SECTORS para filtros) |

## CLI agency:status — Flags disponibles

```
--scope=dryRun|production
--format=json|markdown
--output=<ruta>
--mock-integrations
--strict
--sector=padel,dental,veterinary,...
--classification=A,B,C
--integration=stripe,airtable,...
--summary-only
--webhook-simulate
--webhook-destination=<url>
--webhook-retries=<n>
```

## Controles de seguridad activos

| Control | Módulo |
|---------|--------|
| Path traversal | `agencyService.js::validateSafePath` |
| Redacción de secretos | `agencyService.js::redactSensitiveFields` |
| Redacción en webhook | `agencyWebhookAdapter.js::redactWebhookPayload` |
| Payload size limit (2MB) | `agencyService.js::validatePayloadSize` |
| Stack trace oculto | `agencyService.js::sanitizeErrorForResponse` |
| API solo localhost | `agency-api.mjs::127.0.0.1` |
| Webhook dry-run | `agencyWebhookAdapter.js::fetchImpl=null` |
| Headers HTTP seguros | Cache-Control: no-store, X-Content-Type-Options: nosniff |

## Validación de sectores al cierre

| Sector | Clasificación (dryRun) | Idempotente |
|--------|----------------------|-------------|
| padel (Club Pádel 04) | C (tiene integraciones sin config) | ✅ |
| dental (Clínica Dental Sonrisas) | C (tiene integraciones sin config) | ✅ |
| veterinary (E2E test) | A (sin integraciones declaradas) | ✅ |
| law (bufete, cuarto sector) | A (sin integraciones declaradas) | ✅ |
