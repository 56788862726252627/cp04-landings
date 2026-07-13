# Guía de `client-config.schema.json`

Fecha: 2026-07-08 · Complementa `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md` (capa CLIENT CONFIG). El schema es la única fuente de verdad de tipos/enums/required; este documento explica cómo usarlo y por qué se tomó cada decisión de diseño.

## Ficheros de esta carpeta

| Archivo | Rol |
|---|---|
| `client-config.schema.json` | JSON Schema (draft 2020-12), validable. Incluye 1 ejemplo válido embebido en su propio keyword `examples`. |
| `client-config.example.valid.json` | Ejemplo válido completo, espejo real de la configuración actual de Club Pádel 04 (mismos valores que `COURTS`/`BOOKING_HOURS`/`theme.js` en el código). |
| `client-config.example.invalid.json` | Ejemplo inválido con 10 violaciones deliberadas, una por cada tipo de regla del schema (ver tabla más abajo). |

## Cómo se validó (sin instalar dependencias)

No hay `ajv` ni ningún validador de JSON Schema en `package.json`/`node_modules` de este proyecto, y esta tarea no autoriza añadir dependencias nuevas. Se comprobó en dos pasos:

1. **Sintaxis JSON**: `node -e "JSON.parse(...)"` sobre los 3 archivos — los 3 son JSON sintácticamente válido.
2. **Validación estructural**: se escribió un validador mínimo de un solo uso (sin dependencias, no forma parte del repositorio, vive en el scratchpad de la sesión) que implementa exactamente las palabras clave usadas por este schema: `type`, `required`, `properties`, `additionalProperties`, `items`, `enum`, `const`, `pattern`, `minLength`/`maxLength`, `minItems`, `uniqueItems`, `minimum`. Con él:
   - `client-config.example.valid.json` → **VÁLIDO** (0 violaciones).
   - `client-config.example.invalid.json` → **INVÁLIDO** (10 violaciones, ver tabla).

**Limitación honesta**: el validador casero no implementa `format` (`uri`, `email`, `hostname`) — esas anotaciones están en el schema pero no se verificaron de forma automática en esta sesión (en la especificación JSON Schema 2020-12, `format` es solo una anotación salvo que el validador active el vocabulario de aserción de formato; herramientas como `ajv-formats` sí lo harían). Recomendación futura: si se adopta `ajv` como dependencia real de desarrollo, usar `ajv-formats` para cerrar esta brecha — no se hace en esta tarea porque añadir dependencias no está autorizado aquí.

## Violaciones del ejemplo inválido (una por regla)

| Campo | Valor puesto | Regla violada |
|---|---|---|
| `timezone` | `"NotATimezone"` | `pattern` (no es un IANA tz válido) |
| `roles` | `["OWNER"]` | `enum` (rol inexistente en `rbac.js`) |
| `features.pagos` | `true` | `const: false` (Stripe bloqueado por regla de proyecto) |
| `integrations.data.provider` | `"supabase"` | `enum` (integración no implementada en código — inventada) |
| `integrations.payments.enabled` | `true` | `const: false` (mismo bloqueo que `features.pagos`) |
| `plan.name` | `"enterprise"` | `enum` (no existe en `CONFIG_CONCEPTUAL_MODULOS.md`, solo starter/pro/premium) |
| `domains` | sin `subdomain` | `required` |
| objeto raíz | sin `contact` | `required` |
| objeto raíz | sin `support` | `required` |
| objeto raíz | `randomExtraField: true` | `additionalProperties: false` |

## Fail-closed: cómo se preserva

1. **Roles**: `roles` es `required`, `minItems: 1`, y cada item debe estar en el enum cerrado `[PLAYER, STAFF, ADMIN, SUPPORT]` — exactamente `CP04_ROLES` de `src/utils/rbac.js`. No es posible declarar un rol inventado ni dejar `roles` vacío.
2. **Stripe / WhatsApp / IA**: `features.pagos`, `features.whatsapp`, `features.ia`, `integrations.payments.enabled`, `integrations.messaging.enabled` y `integrations.ai.enabled` usan `const: false` — no es un *default* que se pueda sobreescribir a `true` por config de cliente, es un valor fijado por el schema. Un `client_config` que intente activarlos falla la validación (demostrado con el ejemplo inválido). Coincide exactamente con la evidencia de código: `src/data/makeInventory.js` documenta que Stripe "no está activado en la app (regla del proyecto)"; no existe integración de IA ni de WhatsApp en el código actual.
3. **Integraciones no inventadas**: `integrations.data.provider` solo admite `"airtable"` (lo único implementado hoy); `"supabase"` no está en el enum aunque se mencione como FUTURO en `AGENCY_MULTI_CLIENT_ARCHITECTURE.md` — se añadirá al enum el día que exista código real, no antes.
4. **`additionalProperties: false`** en el objeto raíz y en todos los subobjetos: cualquier campo no descrito explícitamente en el schema hace fallar la validación, en vez de pasar desapercibido.
5. **Nada de secretos**: no existe ningún campo para un valor de secreto. `integrations.automation.webhookRef` e `integrations.data.baseIdRef` son explícitamente *nombres de referencia* (`"MAKE_RESERVAS_WEBHOOK"`, `"AIRTABLE_BASE_ID"`), no valores — el valor real vive en Wrangler secrets, fuera de este repositorio, igual que ya funciona hoy en `worker-reservas/wrangler.toml`.

## No contradice el código actual

- `courts[].price60/90/120`, `id`, `name`, `type` — mismos nombres de campo que la constante `COURTS` en `src/App.jsx:114`.
- `bookingHours` — mismo formato de lista plana `HH:MM` que `BOOKING_HOURS` en `src/App.jsx:121` (no se inventó una estructura `apertura/cierre` que el código no tiene).
- `theme.*` — mismos nombres exactos que `src/theme.js` (`bg`, `surface`, `accent`, `fontDisplay`, etc.).
- `roles` — mismo enum que `CP04_ROLES` en `src/utils/rbac.js`.
- `plan.name` — mismo enum que `CONFIG_CONCEPTUAL_MODULOS.md` (Starter/Pro/Premium), evitando la inconsistencia de usar "enterprise" (que no existe en ningún documento previo del proyecto).
- `integrations.automation`/`data` — reflejan exactamente los dos únicos proveedores con código real (`makeLiveClient.js`, Airtable vía `worker-reservas/wrangler.toml`).

## Compatibilidad futura

- **`schemaVersion`**: fijado a `"1.0.0"` (`const`). Cualquier cambio incompatible (añadir un campo `required` nuevo, cerrar un enum que hoy es abierto, cambiar un tipo) debe ir en una versión `2.0.0` con su propio `$id`, nunca mutando `1.0.0` en sitio — así un `client_config.json` existente no se rompe silenciosamente.
- **`courts` → `resources`**: cuando se construya el primer vertical no deportivo (Fase 4 de `AGENCY_PRODUCTIZATION_ROADMAP.md`), la v2 del schema debería introducir un campo `resources` genérico (`{id, name, type, attributes: {}}`) que generalice `courts`. La v1 mantendría `courts` como alias válido para no romper a Club Pádel 04; la migración se documentará en su momento con evidencia real del primer vertical construido, no de forma especulativa ahora.
- **`integrations.payments`/`messaging`/`ai`**: los `const: false` se retiran únicamente mediante un bump de versión del schema, nunca por una config de cliente individual — es una decisión de arquitectura/negocio, documentada así intencionadamente para que no ocurra por accidente.
- **`locale.language`**: no se cerró a un enum porque no se verificó con certeza el código de región exacto de cada idioma ya presente en `TRANSLATIONS` (`src/App.jsx`) durante esta sesión. Antes de cerrar ese enum en una versión futura, se recomienda extraer la lista real de claves de `TRANSLATIONS` (Quick Win 14 de `AGENCY_QUICK_WINS_PRIORITY.md`, todavía pendiente).
- **`brand.legalLinks`** (pendiente, no en v1): la misión de cierre del runtime multi-tenant (Fase 5, `docs/agencia-ia/RUNTIME_INTEGRATION_SAFE_PLAN.md`) pidió preparar un contrato de branding que incluya "legal links" (términos/privacidad). `brand` en v1.0.0 no tiene ese campo — no existe hoy ningún enlace legal en el código (`App.jsx` no fue inspeccionado con fines de modificación en esa sesión para no invadir el trabajo de T4 sobre ese archivo) ni una fuente de verdad confirmada de la que extraerlo, así que no se fabricó un campo con datos inventados. `src/tenant-runtime/getRuntimeBranding.js` ya deja `legalLinks: null` documentado como pendiente en su cabecera. Propuesta para v2.0.0 (nunca mutar v1.0.0 en sitio, ver arriba): `brand.legalLinks: { terms: uri|null, privacy: uri|null } = { terms: null, privacy: null }`, opcional, no rompe ningún `client-config.json` existente.

## Qué NO hace este Quick Win

No crea ningún loader que lea este schema desde `App.jsx`, no modifica `theme.js`/`COURTS`/`BOOKING_HOURS`, no conecta este archivo a ningún proceso de build. Es la capa de validación (Quick Win 2); cablearlo a la aplicación es un cambio funcional posterior, fuera de esta tarea (ver "Estrategia de migración gradual" en `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md`).
