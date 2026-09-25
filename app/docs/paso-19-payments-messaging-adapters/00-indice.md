# Paso 19 — Adaptadores aislados de pagos y mensajería (Stripe / WhatsApp Business)

Construye dos capas de integración **aisladas y sin credenciales
reales**: `stripeAdapter.js` (pagos) y `whatsappAdapter.js` (mensajería),
en `src/saas-core/commercial/`. Ninguno de los dos está conectado a
ningún flujo comercial de la app — no existe tal flujo en esta rama (el
sistema comercial de la Agencia de IA vive en otro worktree/rama
completamente distinto, `parallel/t8-commercial`, que este paso **no
toca**). Son una capa de integración lista para conectar en el futuro,
con su propio runbook de configuración.

## Decisión de alcance (confirmada explícitamente antes de empezar)

El objetivo original proyectado para este paso era "conectar
pagos/mensajería REALES al flujo comercial" — pero eso requiere
credenciales de producción/sandbox reales de Stripe y de WhatsApp
Business Cloud API, que el flujo autónomo de esta campaña prohíbe
obtener o asumir por cuenta propia. Se preguntó explícitamente al
usuario antes de escribir código, y se confirmó: **construir los
adaptadores completos (contrato, validación, idempotencia,
verificación real de webhooks) en modo `NOT_CONFIGURED`, apilado sobre
PR #46 igualmente**, sin conectarlos a ningún sistema comercial
existente ni asumir credenciales.

## Qué SÍ es real en este paso (aunque no haya credenciales)

- La **verificación de firma de webhook** de ambos proveedores es un
  HMAC-SHA256 real, calculado con `node:crypto`, verificable
  completamente offline con un secreto de prueba — funciona
  exactamente igual que en producción, sin necesitar una cuenta activa.
- La **construcción de la petición HTTP** (URL, cabeceras, cuerpo,
  Idempotency-Key) es real y se prueba inyectando un `fetchImpl` falso
  que captura la petición exacta — si mañana se añaden credenciales
  reales de test, el código funcionaría sin cambios.
- El **gate de consentimiento** de WhatsApp es una regla de negocio
  real, aplicada ANTES de tocar red, con un contrato de "consent store"
  inyectable (no asume ninguna base de datos concreta).

## Qué NUNCA ocurre en este paso

- Ninguna llamada de red real a `api.stripe.com` ni a
  `graph.facebook.com` — sin credenciales, cada función retorna
  `status: "not_configured"` de forma determinista.
- Ninguna clave/token se expone completo en ningún log/informe/test —
  siempre redactado (`redactSecret`).
- Ningún mensaje de WhatsApp se envía sin consentimiento registrado
  explícitamente, incluso si hubiera credenciales configuradas.
- Ninguna clave `sk_live_` se usa sin `allowLiveMode: true` explícito.
- No se instala ningún SDK de terceros (`stripe`, SDKs de Meta) —
  ambos adaptadores usan `fetch` nativo de Node contra las APIs REST
  documentadas, igual que `publicWebsiteFetcher.js` usa `node:https`
  directamente.

## Documentos

1. [01 — Arquitectura: contrato de los dos adaptadores, funciones, gates de seguridad](./01-arquitectura-adaptadores.md)
2. [02 — Runbook de configuración futura (qué hacer el día que haya credenciales reales)](./02-runbook-configuracion.md)
3. [03 — Informe técnico del Paso 19](./03-informe-tecnico-paso-19.md)
4. [04 — Actualización del roadmap maestro vivo (21 pasos)](./04-actualizacion-roadmap-maestro-21-pasos.md)

## Código nuevo

```
src/saas-core/commercial/
├── commercialShared.js       (+ .test.mjs) — idempotencia, redacción, HMAC real, retry/backoff
├── commercialSchemas.js      (+ .test.mjs) — validación pura de payloads
├── commercialFixtures.js     — fixtures deterministas + firmas de webhook reales
├── stripeAdapter.js          (+ .test.mjs) — 7 funciones, NOT_CONFIGURED-safe
└── whatsappAdapter.js        (+ .test.mjs) — consentimiento obligatorio, NOT_CONFIGURED-safe
```

Ningún archivo fuera de `src/saas-core/commercial/` y `docs/` se ha
tocado en este paso.
