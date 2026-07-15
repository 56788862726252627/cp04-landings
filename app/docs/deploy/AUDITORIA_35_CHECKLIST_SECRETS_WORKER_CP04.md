# Club Pádel 04 · Auditoría 35 · Checklist secrets Worker Cloudflare

## Estado

Preparación de Worker realizada sin deploy.

## Auditoría 35

55%

## Avance real estimado del proyecto completo

88.4%

## Variables privadas recomendadas en Cloudflare Worker

Configurar en Cloudflare como secrets/variables privadas, nunca en frontend:

- ALLOWED_ORIGIN
- RESERVAS_WEBHOOK
- DB_API_KEY
- DB_BASE_ID
- DB_RESERVAS_TABLE
- PAGOS_CLAVE_PRIVADA
- PAGOS_FIRMA_WEBHOOK
- MESSAGING_PROVIDER_TOKEN
- MESSAGING_PHONE_NUMBER_ID
- CALENDAR_CREDENTIALS
- STORAGE_CREDENTIALS
- AUTH_PROVIDER
- AUTH_ISSUER_URL
- AUTH_AUDIENCE
- JWT_SECRET, solo si se usa backend propio

## Variables públicas permitidas en frontend

Solo variables VITE_ no sensibles.

## Reglas de seguridad

- El frontend no debe contener tokens privados.
- El frontend debe llamar a endpoint público controlado.
- El Worker debe validar origen permitido.
- El Worker debe controlar CORS.
- El Worker debe validar método HTTP.
- El Worker debe validar payload.
- El Worker debe no imprimir secrets en logs.
- Make/Airtable/Supabase/Stripe deben quedar detrás de backend/Worker.

## Estado de deploy

No desplegar todavía.

## Riesgo

Bajo.
