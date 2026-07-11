# Contrato de contexto de tenant WhatsApp

Fecha: 2026-07-09 · Cómo el adapter WhatsApp aislado (`worker-reservas/messaging/whatsapp-contract.js` + `whatsapp-adapter.mock.js` + `whatsapp-consent.js`) se conecta conceptualmente con la arquitectura multi-tenant ya diseñada (`docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md`, `src/config/resolveTenantContext.js`) y con su puente ejecutable `scripts/whatsapp/tenant-context.mjs`. Documento de diseño — **no conecta ningún servicio real, no crea ninguna ruta en el Worker, WhatsApp permanece con `enabled: false` por regla de proyecto (`config/client-config.schema.json#integrations.messaging.enabled`, const `false`)**.

## 1. Por qué WhatsApp necesita un puente ejecutable y Stripe (por ahora) solo prosa

`docs/agencia-ia/STRIPE_PAYMENT_METADATA_CONTRACT.md` documenta el mapeo `resolveTenantContext()` → adapter Stripe solo en prosa, porque `integrations.stripe` ya expone exactamente los campos que Stripe necesita (`tenantId`, `customerContextRef`). WhatsApp pide más — `sender_profile`, `phone_number_id_reference`, `template_namespace`, `locale`, `timezone` — y ninguno de esos campos existe hoy en la salida de `resolveTenantContext()` salvo `tenantId` y `senderContextRef`. Por eso `scripts/whatsapp/tenant-context.mjs#deriveWhatsappTenantContext()` existe como código real y probado, no solo como diagrama: es el que combina `resolveTenantContext()` (fuente de `tenantId`/`senderContextRef`) con los campos de `resolvedConfig` que ese contrato no reexpone (`clientId`, `brand.name`, `locale`, `timezone`, todos ya obligatorios en `client-config.schema.json`). Mismo patrón que `scripts/observability/tenant-context.mjs` ya usa para el contrato de observabilidad — no un mecanismo nuevo.

## 2. Los 7 campos, uno a uno

| Campo | Origen | Nota |
|---|---|---|
| `tenant_id` | `resolveTenantContext().tenantId` | Igual que Stripe. |
| `client_id` | `resolvedConfig.clientId` (UUID estable) | Distinto de `slug` — más preciso que lo usado en el documento de Stripe, que hoy referencia `slug` a falta de mejor candidato en ese momento. |
| `sender_profile.display_name` | `resolvedConfig.brand.name` | Nombre comercial visible — el que Meta mostraría como remitente. |
| `sender_profile.sender_context_ref` | `resolveTenantContext().integrations.whatsapp.senderContextRef` | Reexpuesto sin modificar — sigue siendo `null` hoy. |
| `phone_number_id_reference` | Ninguno todavía | `null` — `client-config.schema.json` no tiene un campo dedicado (Modelo A/C: un número por Worker, no hace falta distinguir varios números por tenant hasta un Modelo B). |
| `template_namespace` | Derivado (`wa_<tenantId>`) | Convención propia del adapter, no un campo de Meta — sirve para prefijar nombres de plantilla si algún día un WABA compartido sirviera a más de un tenant. |
| `locale` | `resolvedConfig.locale.language`, convertido con `toMetaLocale()` | Ver §3. |
| `timezone` | `resolvedConfig.timezone` | IANA tz, sin conversión — usado para no enviar recordatorios fuera de horario razonable (decisión de negocio pendiente, no implementada aquí). |

## 3. La conversión de locale que hay que recordar

`client-config.schema.json#locale.language` valida contra `^[a-z]{2}(-[A-Z]{2})?$` (guion: `es-ES`). WhatsApp Cloud API exige guion bajo para variantes regionales (`es_ES`). `toMetaLocale()` en `scripts/whatsapp/tenant-context.mjs` hace `languageTag.replace("-", "_")` — no es un caso especial de WhatsApp exclusivamente: es el mismo tipo de desajuste de formato ya documentado para Stripe (`STRIPE_PAYMENT_METADATA_CONTRACT.md`), aquí aplicado al formato de idioma en vez de a nombres de campo. `worker-reservas/messaging/whatsapp-contract.js#SUPPORTED_LANGUAGES` ya usa el formato con guion bajo (`["es","en","es_ES","en_US"]`) — cualquier valor que llegue desde `resolveWhatsappTenantContext()` sin pasar por `toMetaLocale()` no encajaría con ese enum.

## 4. De contexto de tenant a `sendTemplateMessage()`

```
resolvedConfig (mergeConfigLayers)
        │
        ▼
deriveWhatsappTenantContext(resolvedConfig)   // scripts/whatsapp/tenant-context.mjs, ya existe y probado
        │
        ▼
sendTemplateMessage({
  to, templateName, language: whatsappTenantContext.locale,
  variables, tenantId: whatsappTenantContext.tenant_id, idempotencyKey,
}, { consentStore, dedupStore, ... })
```

`sendTemplateMessage()` no llama a `deriveWhatsappTenantContext()` directamente — la separación es deliberada: el adapter (`worker-reservas/messaging/`) es código que se despliega al Worker; `tenant-context.mjs` (`scripts/whatsapp/`) depende de `src/config/resolveTenantContext.js`, que a su vez depende de la capa de configuración completa (`mergeConfigLayers`, carga de ficheros). Mezclar ambos forzaría a empaquetar esa capa de configuración dentro del bundle del Worker. El llamador (hoy inexistente: la futura ruta `POST /api/messaging/whatsapp/send`) es quien uniría ambos, resolviendo el contexto una vez por request y pasando solo los campos primitivos que el adapter necesita.

## 5. Qué NO resuelve este documento

- No decide si un WABA compartido servirá a varios tenants (Modelo B) — hoy Modelo A/C, un WABA por cliente, sigue vigente.
- No crea la ruta real en `worker-reservas/src/index.js`.
- No cambia `enabled: false` en `client-config.schema.json`.
- No implementa el envío de recordatorios respetando `timezone` (el campo se propaga, pero ninguna lógica de "no enviar entre las 22:00 y las 08:00 hora local" existe todavía).
