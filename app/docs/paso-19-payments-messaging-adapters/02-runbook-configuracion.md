# 02 — Runbook: qué hacer el día que haya credenciales reales

Este documento existe para que activar los adaptadores en el futuro sea
un procedimiento claro, no una improvisación. Ninguno de estos pasos se
ha ejecutado en esta sesión — se listan para cuando el usuario decida
avanzar con credenciales reales (fuera del alcance de este paso).

## Stripe

1. Crear una cuenta de Stripe (o usar una existente) y activar el modo
   **Test** en el panel.
2. Copiar la clave secreta de test (`sk_test_...`) y definirla como
   `STRIPE_SECRET_KEY` en el entorno del proceso que use este adaptador
   — **nunca** commitear esta clave en el repositorio.
3. Crear un endpoint de webhook en el panel de Stripe (modo test) y
   copiar su **signing secret** (`whsec_...`) como
   `STRIPE_WEBHOOK_SECRET`.
4. Probar `createCheckoutSession`/`retrieveCheckoutSession`/
   `createRefund` contra el modo test real — en este punto, por primera
   vez, se podría verificar de extremo a extremo contra la API real de
   Stripe (con tarjetas de prueba documentadas por Stripe, nunca datos
   reales).
5. Verificar `verifyStripeWebhookSignature`/`parseStripeWebhookEvent`
   contra un webhook real enviado por Stripe (usando `stripe listen` o
   equivalente) — esto confirma que el HMAC ya implementado (y probado
   con fixtures) también funciona contra el tráfico real de Stripe.
6. **Solo cuando exista una necesidad de negocio real y aprobación
   explícita**: repetir el proceso en modo Live, y pasar
   `allowLiveMode: true` explícitamente en cada llamada — nunca
   activarlo por defecto ni en configuración global.

## WhatsApp Business Cloud API (Meta)

1. Crear una app de Meta for Developers y activar el producto
   "WhatsApp".
2. Obtener un `WHATSAPP_ACCESS_TOKEN` (token de sistema, no el token
   temporal de 24h de pruebas) y el `WHATSAPP_PHONE_NUMBER_ID` del
   número de prueba proporcionado por Meta.
3. Copiar el **App Secret** de la app de Meta como
   `WHATSAPP_APP_SECRET` (para verificar webhooks).
4. Enviar al menos una plantilla de prueba aprobada por Meta a un número
   de test propio, con `recordConsent` ejecutado explícitamente antes
   (nunca asumir consentimiento implícito).
5. Configurar el endpoint de webhook de Meta y verificar
   `verifyWhatsAppWebhookSignature` contra un evento entrante real.
6. Decidir, ANTES de conectar esto a cualquier flujo comercial real, qué
   sistema concreto implementará el "consent store" (Airtable/Postgres/
   KV) — este paso deja el contrato listo, pero la implementación real
   del store queda pendiente y depende de qué sistema de datos use el
   flujo comercial que finalmente lo consuma (fuera de alcance: vive en
   `parallel/t8-commercial`, no tocado por este paso).

## Advertencias explícitas para cualquier integración futura

- Nunca guardar `STRIPE_SECRET_KEY`/`WHATSAPP_ACCESS_TOKEN`/
  `WHATSAPP_APP_SECRET`/`STRIPE_WEBHOOK_SECRET` en el repositorio, en
  `.env` versionado, ni en ningún archivo que pueda commitearse por
  error.
- `allowLiveMode: true` es una decisión de negocio explícita por
  llamada, no una variable de entorno global — evita que un despliegue
  mal configurado empiece a cobrar en producción por accidente.
- El "consent store" es responsabilidad de quien conecte este adaptador
  a un flujo real — nunca asumir que "está configurado" implica
  "hay consentimiento": son gates independientes y en ese orden
  (`sendTemplateMessage`/`sendTextMessage` comprueban primero
  consentimiento, luego configuración).
- `sendTextMessage` no verifica por sí mismo la ventana de sesión de 24h
  de WhatsApp — quien lo integre debe rastrear el último mensaje
  entrante del usuario y decidir si corresponde plantilla o texto libre.
