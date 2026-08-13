# Club Pádel 04 · Auditoría 25 · Checklist Cloudflare real segura

## Objetivo

Preparar la configuración real de Cloudflare Pages y Cloudflare Worker sin exponer credenciales.

## Estado actual

- Frontend estable.
- Build correcto.
- Worker presente.
- Wrangler presente.
- Auditorías 23 y 24 cerradas.
- Deploy real pendiente.
- Secrets reales pendientes.
- Supabase real pendiente.

## 1 · Cloudflare Pages

Proyecto recomendado:

- club-padel-04

Configuración esperada:

- Build command: npm run build
- Output directory: dist
- Framework preset: Vite / React
- Node version: estable actual

Variables públicas permitidas:

- VITE_CP04_PUBLIC_AUTH_MODE
- VITE_CP04_PUBLIC_SITE_URL
- VITE_CP04_PUBLIC_BOOKING_ENDPOINT
- VITE_CP04_PUBLIC_CONTACT_EMAIL
- VITE_CP04_PUBLIC_CONTACT_PHONE
- VITE_CP04_PUBLIC_SEO_AREA
- VITE_CP04_PUBLIC_GALLERY_PISTAS
- VITE_CP04_PUBLIC_GALLERY_RECEPCION
- VITE_CP04_PUBLIC_GALLERY_CAFETERIA
- VITE_CP04_PUBLIC_GALLERY_TORNEOS
- VITE_CP04_PUBLIC_GALLERY_INSTALACIONES

## 2 · Prohibido en Cloudflare Pages

No añadir nunca en Pages:

- AIRTABLE_TOKEN
- MAKE_RESERVAS_WEBHOOK
- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- EMAIL_PROVIDER_TOKEN
- WHATSAPP_ACCESS_TOKEN

## 3 · Cloudflare Worker

Worker esperado:

- cp04-reservas-proxy

Ruta local:

- worker-reservas/src/index.js

Config local:

- worker-reservas/wrangler.toml

Variables no secret permitidas:

- ALLOWED_ORIGIN

Valor inicial:

- https://club-padel-04.pages.dev

Cuando exista dominio final:

- https://TU-DOMINIO-FINAL.com

## 4 · Secrets privados Worker

Configurar manualmente en Cloudflare Worker:

### Reservas / Make

- MAKE_RESERVAS_WEBHOOK

### Airtable

- AIRTABLE_TOKEN
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID
- AIRTABLE_RESERVAS_TABLE

### Supabase Auth

- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_PUBLIC_URL

### Futuros

- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- EMAIL_PROVIDER_TOKEN
- WHATSAPP_ACCESS_TOKEN

## 5 · Pruebas antes de deploy

Antes de desplegar:

- npm run build
- revisar dist
- revisar wrangler.toml enmascarado
- comprobar que no hay tokens privados en src
- comprobar que no hay tokens privados en dist
- confirmar dominio/URL Pages
- confirmar URL Worker
- confirmar CORS

## 6 · Pruebas después de deploy

Después de desplegar Worker:

- GET /api/disponibilidad
- GET /api/reservas
- POST /api/reservas
- POST /api/jugadores/alta
- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/change-password
- OPTIONS /api/auth/login

Después de desplegar Pages:

- abrir home
- probar sidebar
- probar módulos
- probar roles
- probar perfil
- probar soporte
- probar reserva visual
- revisar consola navegador
- revisar responsive tablet/móvil

## 7 · Limpieza futura recomendada

Mover fuera de src los backups antiguos:

- src/App.jsx.backup-*
- worker-reservas/src/index.js.backup-*

No borrar todavía sin checkpoint específico.

## Estado

Checklist Cloudflare real segura preparada.
