# Contrato de Aislamiento de Tenant (Tenant Isolation Contract)

Fecha: 2026-07-09 · Reglas explícitas de qué debe llevar `tenantId` y cómo se deriva, para cuando (si) se migre del Modelo A/C actual (un Worker/Airtable/Make por cliente, aislamiento físico) hacia cualquier escenario con recursos compartidos. Ver `audit/agency-platform-architecture/AGENCY_SECURITY_MODEL.md` (control "Tenant isolation", clasificado P0 condicional a Modelo B) y `AGENCY_MULTI_CLIENT_ARCHITECTURE.md` §2 (comparativa de modelos) — este documento formaliza el contrato de datos, no repite la comparativa de modelos ni decide cuál usar. **No conecta ningún servicio real.**

## 1. `tenant_id` obligatorio

Todo objeto de contexto definido en este documento lleva `tenantId` como campo obligatorio, sin default. `resolveTenantContext()` (`src/config/resolveTenantContext.js`) lanza si se le pasa un `resolvedConfig` sin `tenantId` — no existe un "tenant por defecto" a nivel de plataforma (mismo principio ya aplicado en `loadClientConfig`: ni siquiera Club Pádel 04 es implícito).

## 2. `domain → tenant`

Ver `docs/agencia-ia/DOMAIN_TENANT_RESOLUTION.md` para el algoritmo completo. Regla de aislamiento: un dominio resuelve a **como mucho un** `tenantId` — nunca a una lista, nunca de forma ambigua. Un dominio duplicado en el registro (`config/tenant-registry.schema.json`) es un error de validación dura (ver `src/config/validateResolvedConfig.js`), no un caso a resolver en runtime con prioridad arbitraria.

## 3. Request context

Forma mínima que cualquier request debería llevar si en el futuro hay un Worker compartido (Modelo B): `{ tenantId, verticalId, requestId }`. `requestId` no es un concepto nuevo — reutiliza el mismo patrón de correlación ya construido en `schemas/observability/log-event.schema.json` (`correlationId`); este contrato solo añade `tenantId` como dimensión adicional obligatoria en ese mismo objeto, no crea un mecanismo de correlación paralelo.

## 4. Observability context

`{ tenantId, correlationPrefix }` — `correlationPrefix` es `` `${tenantId}:` `` para que cualquier `correlationId`/`logEvent` generado por `schemas/observability/log-event.schema.json` pueda namespacearse por tenant sin cambiar ese schema (el campo `correlationId` ya es un string libre). Este documento no modifica `schemas/observability/*` — describe cómo un futuro emisor multi-tenant debería rellenar esos campos, nada más.

## 5. Backup context

`{ tenantId, scope: "client-config" }` — hoy el único artefacto de un tenant que tendría sentido respaldar desde esta capa es su `client-config.json` validado (los datos operativos viven en Airtable, fuera de este alcance, ver `AGENCY_SECURITY_MODEL.md` control "Backups"). No se conecta a ningún mecanismo de backup real (ver trabajo ya existente de resiliencia en otra terminal, referenciado en memoria del proyecto) — es solo el campo de identificación que ese mecanismo necesitaría para saber de quién es cada respaldo.

## 6. Audit log context

`{ tenantId, actorRole }` — mínimo necesario para que una futura auditoría de acciones de usuario (`AGENCY_SECURITY_MODEL.md`, control "Auditoría de acciones", P1) pueda filtrar por cliente. No se implementa el log en sí.

## 7. Feature flags

Ya resueltos de forma tenant-aware por construcción: `resolveFeatureFlags()`/`mergeConfigLayers()` siempre reciben el `client-config.json` de un tenant concreto — no existe un cálculo de flags "sin tenant". El campo `resolvedConfig.tenantId` es lo que ancla ese resultado a un tenant específico.

## 8. Config resolution

`resolvedConfig` (salida de `mergeConfigLayers`) es siempre el resultado de tres documentos concretos — nunca se cachea entre tenants distintos. Un proceso que resuelva config para N tenants debe recalcular o cachear por `tenantId`, ver namespace de caché (§9).

## 9. Cache namespace

`` `tenant:${tenantId}` `` — prefijo obligatorio para cualquier futura caché de `resolvedConfig` u otro dato derivado de un tenant. Evita que una clave de caché mal construida (p. ej. solo por `slug` cuando dos tenants compartieran slug por error humano) sirva datos de un cliente a otro.

## 10. Storage namespace

`` `tenant:${tenantId}` `` — mismo prefijo, mismo motivo, para cualquier storage futuro (KV, R2, etc.) que no sea ya una base de datos aislada por cliente (Airtable ya está físicamente aislado por `baseIdRef` en el Modelo A/C actual, no necesita este prefijo hoy).

## 11. Make scenario context (futuro, no conectado)

`{ tenantId, scenarioSetRef: client.integrations.automation.webhookRef ?? null }` — hoy cada cliente ya tiene su propio conjunto de escenarios Make (Modelo A), así que este campo es solo una referencia de trazabilidad, no un mecanismo de routing. **No se crea, modifica ni consulta ningún escenario real de Make desde este documento ni desde `resolveTenantContext.js`.**

## 12. Airtable/base context (futuro)

`{ tenantId, baseContextRef: client.integrations.data.baseIdRef ?? null }` — mismo criterio: referencia de trazabilidad al nombre de secret ya definido en `client-config.schema.json#integrations.data.baseIdRef`, sin conexión real.

## 13. Stripe customer/account context (futuro)

`{ tenantId, customerContextRef: null, enabled: false }` — `enabled` siempre `false`, reflejando el `const: false` ya presente en `client-config.schema.json#integrations.payments.enabled`. Este campo existe únicamente para que, el día que Stripe se active por decisión de negocio explícita, ya haya un lugar preparado en el contexto de tenant donde aparecer.

## 14. WhatsApp sender/channel context (futuro)

`{ tenantId, senderContextRef: null, enabled: false }` — mismo criterio que Stripe, reflejando `integrations.messaging.enabled: const false`.

## Resumen de forma (`resolveTenantContext(resolvedConfig)`)

```
{
  tenantId, slug, verticalId,
  domain: { primary, subdomain },
  cacheNamespace: "tenant:<tenantId>",
  storageNamespace: "tenant:<tenantId>",
  observability: { tenantId, correlationPrefix },
  backup: { tenantId, scope: "client-config" },
  audit: { tenantId, actorRole: null },
  integrations: {
    make: { tenantId, scenarioSetRef },
    airtable: { tenantId, baseContextRef },
    stripe: { tenantId, customerContextRef: null, enabled: false },
    whatsapp: { tenantId, senderContextRef: null, enabled: false }
  }
}
```

Implementación: `src/config/resolveTenantContext.js`.
