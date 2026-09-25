# Club Pádel 04 · Auditoría 25 · Guía segura de secrets Cloudflare Worker

## Objetivo

Preparar la introducción manual y segura de secrets reales en Cloudflare Worker sin exponer credenciales en frontend, src, dist, logs ni documentación.

## Regla principal

Los secrets reales solo deben introducirse en Cloudflare Worker.

No deben guardarse en:

- src/
- dist/
- docs/
- backups/
- .env público
- variables VITE_
- capturas de pantalla
- mensajes de chat
- terminal compartida

---

## 1 · Worker objetivo

Nombre recomendado:

- cp04-reservas-proxy

Ruta local:

- worker-reservas/src/index.js

Archivo de configuración:

- worker-reservas/wrangler.toml

---

## 2 · Secrets mínimos para reservas

Configurar en Cloudflare Worker:

- MAKE_RESERVAS_WEBHOOK
- AIRTABLE_TOKEN
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID
- AIRTABLE_RESERVAS_TABLE

Comandos conceptuales:

npx wrangler secret put MAKE_RESERVAS_WEBHOOK
npx wrangler secret put AIRTABLE_TOKEN
npx wrangler secret put AIRTABLE_BASE_ID
npx wrangler secret put AIRTABLE_TABLE_ID
npx wrangler secret put AIRTABLE_RESERVAS_TABLE

---

## 3 · Secrets mínimos para Supabase Auth

Configurar en Cloudflare Worker:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_PUBLIC_URL

Comandos conceptuales:

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put APP_PUBLIC_URL

Notas:

- SUPABASE_URL apunta al proyecto Supabase real.
- SUPABASE_ANON_KEY puede usarse desde backend Worker para auth pública.
- APP_PUBLIC_URL debe apuntar a la URL pública final de la app.

---

## 4 · Secrets futuros

Solo cuando se activen esas funciones:

### Pagos

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

### Email

- EMAIL_PROVIDER_TOKEN

### WhatsApp

- WHATSAPP_ACCESS_TOKEN

### Sesiones/JWT propios

- SESSION_SECRET
- JWT_VERIFICATION_KEY

### Supabase service role

- SUPABASE_SERVICE_ROLE_KEY

Advertencia:

SUPABASE_SERVICE_ROLE_KEY nunca debe estar en frontend ni en variables VITE_.

---

## 5 · Variables no secret

En wrangler.toml solo se permite información no sensible.

Ejemplo:

ALLOWED_ORIGIN=https://club-padel-04.pages.dev

Cuando exista dominio final:

ALLOWED_ORIGIN=https://TU-DOMINIO-FINAL.com

---

## 6 · Variables públicas Cloudflare Pages

Solo usar variables VITE_ públicas:

- VITE_CP04_PUBLIC_AUTH_MODE
- VITE_CP04_PUBLIC_SITE_URL
- VITE_CP04_PUBLIC_BOOKING_ENDPOINT

Ejemplo:

VITE_CP04_PUBLIC_AUTH_MODE=production
VITE_CP04_PUBLIC_SITE_URL=https://club-padel-04.pages.dev
VITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas

---

## 7 · Orden recomendado para introducir secrets

1. Confirmar Worker correcto.
2. Confirmar cuenta Cloudflare correcta.
3. Confirmar proyecto Pages correcto.
4. Introducir secrets de reservas.
5. Introducir secrets de Supabase.
6. Desplegar Worker.
7. Probar endpoints.
8. Desplegar frontend.
9. Probar E2E.

---

## 8 · Pruebas después de meter secrets

Reservas:

curl -i https://URL-WORKER/api/disponibilidad
curl -i https://URL-WORKER/api/reservas

Auth:

curl -i https://URL-WORKER/api/auth/me
curl -i -X OPTIONS https://URL-WORKER/api/auth/login

Login real:

curl -i -X POST https://URL-WORKER/api/auth/login -H "Content-Type: application/json" -d '{"email":"usuario@ejemplo.com","password":"PASSWORD"}'

---

## 9 · Checklist de seguridad

Antes de cualquier deploy:

- No hay tokens reales en src.
- No hay tokens reales en dist.
- No hay tokens reales en docs.
- No hay tokens reales en backups.
- No hay tokens reales en variables VITE_.
- wrangler.toml no contiene secretos privados.
- Los secrets se han introducido desde Cloudflare/Wrangler.
- CORS apunta solo al dominio permitido.

## Estado

Guía segura de secrets Cloudflare Worker preparada.
