# 04 — Integraciones: Stripe, WhatsApp, Airtable, Make — estados, privacidad, consentimiento, credenciales pendientes

## Los 9 estados (`integrationReadiness.js`)

`NOT_CONFIGURED` · `MOCK` · `SANDBOX` · `READY_FOR_CREDENTIALS` ·
`TESTING` · `READY_FOR_PRODUCTION` · `PRODUCTION` · `DEGRADED` · `ERROR`.

Ninguno se calcula con una comprobación de red real — `lastCheckedIso`
es siempre `null` en este paso. El estado se deriva únicamente de:
variables de entorno presentes (`env.STRIPE_SECRET_KEY`, etc.) y de
`externalContext` (hechos ya conocidos y declarados explícitamente por
quien invoca, como "Airtable con cuota agotada" o "N flujos de Make ya
validados") — nunca inferido de una llamada real.

## Stripe

- `NOT_CONFIGURED` sin `STRIPE_SECRET_KEY`.
- `SANDBOX` con una clave `sk_test_`.
- `READY_FOR_PRODUCTION` con una clave `sk_live_` — el bloqueo real de
  seguridad (nunca usar la clave live sin `allowLiveMode: true`
  explícito) sigue viviendo en `stripeAdapter.js` (Paso 19), no
  duplicado aquí.
- Requisitos/credenciales/runbook: ver
  `docs/paso-19-payments-messaging-adapters/02-runbook-configuracion.md`.

## WhatsApp Business Cloud API

- `NOT_CONFIGURED` sin `WHATSAPP_ACCESS_TOKEN`+`WHATSAPP_PHONE_NUMBER_ID`.
- `SANDBOX` con ambos presentes.
- El gate de **consentimiento obligatorio** (`hasRecordedConsent`,
  verificado ANTES que la configuración) sigue viviendo en
  `whatsappAdapter.js`/`commercialSandbox.js` — nunca se envía ni se
  simula como enviado un mensaje sin consentimiento registrado, aunque
  haya credenciales.

## Airtable

- `NOT_CONFIGURED` sin `AIRTABLE_API_KEY`.
- `DEGRADED` si `externalContext.airtableKnownDegraded` se declara
  explícitamente (estado conocido del proyecto: cuota gratuita agotada,
  pendiente de renovación — paso 2 de la secuencia de trabajo confirmada
  por el usuario).
- Este paso NO intenta ninguna llamada real a la API de Airtable para
  comprobar la cuota — sería precisamente lo que la secuencia de trabajo
  pide posponer.

## Make (50 flujos)

- `MOCK` sin ningún flujo validado con llamadas reales.
- `TESTING` con una validación parcial (`externalContext.makeValidatedFlowCount`).
- `READY_FOR_PRODUCTION` con los 50 validados.
- Bloqueado por Airtable operativo (dependencia declarada explícitamente
  en `blockedBy`).

## Gmail / dominio / SSL / hosting / backups / monitorización

Todos `NOT_CONFIGURED` por defecto, con dependencias encadenadas
declaradas (`ssl`/`hosting` dependen de `domain`; `backups`/
`monitoring` dependen de `hosting`) — reflejando honestamente que ninguno
de estos pasos de producción se ha empezado todavía (pasos 6-7 de la
secuencia de trabajo del usuario).

## Privacidad y consentimiento

- `integrationReadiness.js`/`commercialSandbox.js` nunca leen ni
  procesan datos personales de clientes reales — solo variables de
  entorno de configuración y datos de negocio ya normalizados por
  `CommercialAssessment`.
- El "consent store" de WhatsApp (Paso 19, reutilizado aquí) es un
  contrato inyectable — este paso no asume ninguna base de datos
  concreta ni almacena consentimientos reales en ningún sitio.
- Ninguna simulación de este paso envía, procesa o almacena un número de
  teléfono o dato de pago real — todos los ejemplos usan fixtures
  explícitamente marcadas como tales.

## Credenciales pendientes (lista exacta, ver también doc. 07)

| Integración | Credenciales | Quién las provee |
|---|---|---|
| Airtable | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` | Usuario (cuenta Airtable) |
| Make | `MAKE_API_TOKEN` (opcional) | Usuario (cuenta Make) |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Usuario (titular del negocio/agencia) |
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET` | Usuario (tras contratar WhatsApp Business) |
| Gmail | `GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET` | Usuario |
| Dominio | Acceso al panel de Hostinger | Usuario (tras la compra) |

## Tareas que quedarán bloqueadas hasta disponer de Airtable/WhatsApp/Stripe/dominio

1. Validación real de los 50 flujos de Make (bloqueada por Airtable).
2. Envío real de plantillas/mensajes WhatsApp (bloqueada por
   contratación de WhatsApp Business).
3. Checkout/reembolso reales de Stripe en modo test o live (bloqueada
   por configuración de Stripe).
4. Webhooks reales firmados por Stripe/Meta contra un endpoint público
   (bloqueada por dominio + hosting).
5. SSL/backups/monitorización de producción (bloqueadas en cadena por
   dominio → hosting).
6. Cualquier venta/piloto real con un cliente (Paso 21) que dependa de
   cobrar o enviar mensajes de verdad.
