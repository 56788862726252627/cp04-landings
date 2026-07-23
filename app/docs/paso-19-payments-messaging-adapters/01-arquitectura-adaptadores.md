# 01 — Arquitectura de los adaptadores

## `stripeAdapter.js` — 7 funciones

| Función | Qué hace | Gate de seguridad |
|---|---|---|
| `isStripeConfigured(env)` | ¿hay `STRIPE_SECRET_KEY`? | — |
| `getStripeRuntimeStatus(env)` | Estado legible (modo test/live/unconfigured, clave redactada) | Nunca expone la clave completa |
| `createCheckoutSession(params, opts)` | Crea una Checkout Session real | Params inválidos → `invalid_params`; sin configurar → `not_configured`; modo `live` sin `allowLiveMode` → `blocked_live_mode` |
| `retrieveCheckoutSession(id, opts)` | Consulta el estado de una sesión | Mismos gates |
| `createRefund(params, opts)` | Reembolso total o parcial | Mismos gates |
| `verifyStripeWebhookSignature(payload, header, secret, opts)` | Verifica `t=...,v1=...` con HMAC-SHA256 real | Comparación en tiempo constante; tolerancia de timestamp opcional |
| `parseStripeWebhookEvent(payload, header, secret, opts)` | Verifica + parsea a JSON | Nunca devuelve el evento si la firma no es válida |

Cada función de escritura genera una **Idempotency-Key determinista**
(`generateIdempotencyKey`, SHA-256 sobre campos estables del propio
pedido — nunca un UUID aleatorio) para que un reintento del MISMO
comando (p. ej. tras un timeout) reutilice la misma clave, evitando un
cobro/reembolso duplicado si Stripe llega a procesar la primera petición
pese al timeout aparente.

## `whatsappAdapter.js` — funciones y gate de consentimiento

| Función | Qué hace | Gate de seguridad |
|---|---|---|
| `isWhatsAppConfigured(env)` | ¿hay token + phone number id? | — |
| `getWhatsAppRuntimeStatus(env)` | Estado legible | Nunca expone el token completo |
| `hasRecordedConsent(store, phone)` | Consulta un "consent store" inyectable | — |
| `recordConsent(store, phone, {granted, source, recordedAtIso})` | Registra consentimiento explícito | Exige `granted: boolean` explícito, nunca lo infiere |
| `sendTemplateMessage(params, opts)` | Envía una plantilla aprobada | Orden de gates: **params → consentimiento → configuración** — nunca se llega a la red sin las tres |
| `sendTextMessage(params, opts)` | Mensaje de texto libre (ventana de 24h) | Mismos gates |
| `verifyWhatsAppWebhookSignature(payload, header, appSecret)` | Verifica `X-Hub-Signature-256: sha256=...` | Comparación en tiempo constante |
| `parseWhatsAppWebhookEvent(payload, header, appSecret)` | Verifica + parsea | Nunca devuelve el evento si la firma no es válida |

### El "consent store" es un contrato, no una base de datos concreta

```js
// contrato mínimo:
{ get(phoneE164): {granted: bool, source, recordedAtIso} | undefined,
  set(phoneE164, record): void }
```

`commercialFixtures.createInMemoryConsentStore()` da una implementación
de prueba en memoria (usada solo en tests) — cualquier integración
futura pasaría su propio store (Airtable, Postgres, KV, etc.) sin tocar
`whatsappAdapter.js`.

## Por qué la verificación de firma es "real" sin credenciales

Tanto Stripe como Meta firman los webhooks con **HMAC-SHA256 sobre el
payload crudo**, usando un secreto que el propio panel de configuración
entrega (webhook signing secret / App Secret) **sin necesitar una
cuenta con fondos ni un número de WhatsApp aprobado** — es la misma
primitiva criptográfica documentada públicamente por ambos proveedores.
Por eso este paso puede implementar y **verificar exhaustivamente** esta
pieza sin ninguna credencial de producción: los tests usan un secreto
de prueba (`FIXTURE_STRIPE_WEBHOOK_SECRET`/`FIXTURE_WHATSAPP_APP_SECRET`,
ambos con "fixture" en el nombre para que sea imposible confundirlos con
un secreto real) y firman el payload con el MISMO código
(`computeHmacSha256Hex`) que usa el adaptador — si el código de
verificación tuviera un bug, el test lo detectaría.

## Por qué NO se puede considerar "real" el envío/cobro en sí

A diferencia de la verificación de firma, `createCheckoutSession`,
`createRefund`, `sendTemplateMessage` y `sendTextMessage` sí requieren
una llamada de red saliente autenticada — y sin una clave/token de al
menos modo TEST, esa llamada **nunca ocurre** en este paso (ver
`guardConfiguredAndSafeMode`/`configGate`). La correcta CONSTRUCCIÓN de
la petición (URL, cabeceras, cuerpo, forma de los parámetros) está
verificada por test inyectando un `fetchImpl` falso — pero eso confirma
que "si Stripe/Meta recibieran esta petición, tendría la forma
correcta", no que "se ha probado contra un servidor real de
Stripe/Meta". Esa prueba real queda para cuando existan credenciales de
test — ver el runbook (documento 02).

## Diferencias respecto al trabajo de Stripe/WhatsApp de otras sesiones

Existe evidencia (en la memoria de sesiones anteriores, fuera de esta
rama/worktree) de un "Stripe adapter aislado" (7 funciones) y un
"WhatsApp adapter aislado" (10 funciones) construidos en el contexto del
sistema comercial de la Agencia de IA (`audit/agency-commercial-system/`,
rama `parallel/t8-commercial`). Este paso **no reutiliza ese código**
(vive en una rama/worktree no accesible desde esta cadena de PRs
apilados) — es un build nuevo, con su propio diseño, pensado para la
cadena de Pasos 14-18 de `feature/*-20260723`. Ambos comparten el mismo
principio (`NOT_CONFIGURED` por defecto, nunca credenciales asumidas)
por ser la única postura honesta posible sin acceso a secretos reales,
no por compartir una sola línea de código.
