# Paso 24 — API Interna + Capa de Entrega (Prompt Agencia IA 6/7)

**Fecha:** 2026-07-31  
**Estado:** COMPLETADO — Clasificación B ✅  
**Tests añadidos:** 87 (40 service + 31 webhook + 16 api-router)  
**Tests totales repo:** 1975 (177 archivos, 0 fallos)  
**Sin commit, sin push**

---

## Arquitectura

```
CLI (agency-status.mjs, agency-api.mjs)
        │
        ├── agencyService.js      ← validación, filtrado, seguridad (puro, sin I/O)
        ├── agencyWebhookAdapter.js ← webhook simulación (puro, sin red)
        └── agencyApiRouter.mjs   ← handler HTTP localhost (Node.js http)
                    │
                    └── agencyStatusReport.js (P5/7) → businessStatusReport.js (P4/7)
```

**Principio de separación:**
- `agencyService.js` — funciones puras (no I/O, no red, sin imports de factory-cli)
- `agencyWebhookAdapter.js` — funciones puras (no I/O, no red)
- `agencyApiRouter.mjs` — I/O local (carga negocios), en factory-cli para evitar dep. circular

---

## Archivos creados

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/saas-core/factory/agencyService.js` | NUEVO | Service layer puro: validación, filtros, redacción, seguridad |
| `src/saas-core/factory/agencyService.test.mjs` | NUEVO | 40 tests: validación, filtros, path traversal, redacción, secretos, clasificaciones, compatibilidad multisector |
| `src/saas-core/factory/agencyWebhookAdapter.js` | NUEVO | Webhook simulation adapter: payload, idempotencyKey, redacción, dry-run, mock adapter para tests |
| `src/saas-core/factory/agencyWebhookAdapter.test.mjs` | NUEVO | 31 tests: idempotencyKey, payload, destino, redacción, simulación, bloqueo de red real |
| `factory-cli/agencyApiRouter.mjs` | NUEVO | Handler HTTP local para 5 endpoints REST |
| `factory-cli/agencyApiRouter.test.mjs` | NUEVO | 16 tests: todos los endpoints, errores, corrupted biz, no stack trace, Content-Type, Cache-Control |
| `factory-cli/agency-api.mjs` | NUEVO | CLI entry `npm run agency:api` — servidor HTTP localhost:3742 |
| `docs/paso-24-api-interna-agencia-ia-p6/README.md` | NUEVO | Esta documentación |

## Archivos modificados

| Archivo | Cambios |
|---|---|
| `factory-cli/agency-status.mjs` | +filtros (--sector, --classification, --integration, --summary-only, --webhook-simulate, --webhook-destination, --webhook-retries) |
| `package.json` | +script `agency:api` |

---

## Endpoints REST locales

El servidor solo escucha en `127.0.0.1` (nunca público). Arrancar con `npm run agency:api`.

| Endpoint | Descripción |
|---|---|
| `GET /api/agency/health` | Liveness check, lista de endpoints, versión |
| `GET /api/agency/status` | Informe completo de agencia (filtrable, resumible) |
| `GET /api/agency/businesses` | Array de negocios con metadata de carga |
| `GET /api/agency/integrations` | Resumen cruzado de integraciones por negocio |
| `GET /api/agency/sectors` | Lista de sectores e integraciones disponibles |

### Parámetros de consulta (todos opcionales)

| Parámetro | Valores | Descripción |
|---|---|---|
| `scope` | `dryRun` (def) / `production` | Alcance de evaluación |
| `format` | `json` (def) / `markdown` | Formato de salida |
| `sectors` | `padel,dental,veterinary,...` | Filtro por sector (coma-separados) |
| `classifications` | `A,B,C` | Filtro por clasificación |
| `integrations` | `stripe,airtable,...` | Filtro por integración declarada |
| `summary` | `true` | Solo resumen (sin array businesses) |
| `mock-integrations` | `true` | Simula credenciales TEST |

### Estructura de respuesta

```json
{
  "status": "ok",
  "data": { ... },
  "metadata": { ... },
  "errors": [{ "code": "...", "message": "..." }]
}
```

---

## Comandos CLI disponibles

```bash
# Estado de la agencia (P5/7 + filtros P6/7)
npm run agency:status
npm run agency:status -- --sector=padel,dental --classification=A,B
npm run agency:status -- --scope=production --format=json --strict
npm run agency:status -- --summary-only --format=json

# Simulación de webhook (dry-run, nunca red real)
npm run agency:status -- --webhook-simulate
npm run agency:status -- --webhook-simulate --webhook-destination=https://hook.make.com/abc --webhook-retries=3

# API local
npm run agency:api                    # Escucha en :3742
npm run agency:api -- --port=4000     # Puerto personalizado
```

---

## Seguridad

| Control | Estado |
|---|---|
| Path traversal | Bloqueado en `validateSafePath` |
| Stack traces en respuestas | Bloqueados (`sanitizeErrorForResponse`) |
| Secretos en respuestas | Redactados (`redactSensitiveFields`) |
| Payload oversized | Limitado a 2MB (`validatePayloadSize`) |
| Envío real de webhook | Bloqueado por doble cerrojo: `dryRun=true` + `fetchImpl=null` |
| API pública | Solo `127.0.0.1` en `agency-api.mjs` |
| Cabeceras HTTP | `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` |
| Formato inválido | Rechazado con 400 y error estructurado |
| Método no GET | Rechazado con 405 |

---

## Estrategia de webhook mock

El adaptador (`agencyWebhookAdapter.js`) opera siempre en dry-run. Para desbloquear el envío real se necesitan **simultáneamente**:
1. `dryRun = false` (no por defecto)
2. `fetchImpl` real (no null, no provisto en este módulo)

Esto es imposible de activar accidentalmente. La firma y las credenciales del webhook siempre se redactan en los logs de simulación.

---

## Limitaciones actuales

- **Sin servidor persistente**: `agency:api` es on-demand (no hay daemon ni systemd)
- **Sin autenticación en la API local**: está pensada para uso en red local exclusivamente
- **Sectores del filtro**: usan `KNOWN_SECTORS` del schema de blueprint (`padel`, `dental`, etc.), NO los IDs de plantilla (`padel-club`)
- **Webhook en dry-run**: nunca envía a Make, Airtable, ni ningún servicio externo

---

## Estado de servicios externos

| Servicio | Estado |
|---|---|
| Google Drive | Diseñado (OAuth real configurado localmente, sin llamadas en tests) |
| Airtable | NOT_CONFIGURED (cero llamadas reales) |
| Stripe | NOT_CONFIGURED (cero llamadas reales) |
| WhatsApp | NOT_CONFIGURED (cero llamadas reales) |
| Make | NOT_CONFIGURED (webhook en dry-run únicamente) |
| Correo / Gmail | No integrado |
| Dominio / Hosting | No modificado |

---

## Cómo ejecutar los tests sin OOM

```bash
# Suite completa en 4 bloques secuenciales + binarios individuales
cd app

# Bloque A-D (ajustar según lista de archivos actual):
node --test --test-concurrency=1 $(find src factory-cli tenant-cli research-cli commercial-cli -name '*.test.mjs' | grep -viE 'pdfEngine|docxEngine|pptxEngine|binaryValidator' | sort | head -44)

# Binarios individualmente:
node --test --test-concurrency=1 src/saas-core/deliverables/binary/binaryValidator.test.mjs
node --test --test-concurrency=1 src/saas-core/deliverables/binary/pdfEngine.test.mjs
node --test --test-concurrency=1 src/saas-core/deliverables/binary/docxEngine.test.mjs
node --test --test-concurrency=1 src/saas-core/deliverables/binary/pptxEngine.test.mjs
```

---

## Procedimiento futuro para Make / webhooks reales

1. Configurar `MAKE_WEBHOOK_URL` en Worker secrets (ya tiene acceso a Supabase/Airtable)
2. Implementar `fetchImpl` real en una capa de infraestructura separada (no en este módulo)
3. Configurar `signatureKey` con HMAC-SHA256 para validación de destino
4. Probar en staging antes de activar en producción
5. Seguir el runbook en `audit/` para el checklist de activación

---

## Compatibilidad multisector confirmada

Sectores probados en tests: `padel`, `dental`, `veterinary`, `healthcare-clinic` (physiotherapy)  
Todos los sectores de `KNOWN_SECTORS` son filtrados correctamente por `filterAgencyReport`.

---

## Próximo paso

**Prompt Agencia IA 7/7** — basado en el progreso:  
La capa de entrega interna ya está completa. El P7 debería abordar la capa de exposición externa real:
activación controlada de los primeros servicios reales (Stripe en sandbox, Airtable en producción,
Make webhook con credenciales reales), o la integración de la agencia en el frontend (App.jsx).
