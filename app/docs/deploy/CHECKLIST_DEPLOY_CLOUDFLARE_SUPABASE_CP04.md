# Club Pádel 04 · Auditoría 23 · Checklist Deploy Cloudflare + Supabase

## Objetivo

Preparar el despliegue real de preproducción conectando:

- Frontend estático en Cloudflare Pages.
- Worker `cp04-reservas-proxy`.
- Supabase Auth real.
- Variables públicas seguras.
- Secrets privados solo en Cloudflare Worker.

## Estado actual

- App local estable.
- Build correcto.
- Dist generado.
- Worker presente.
- Wrangler presente.
- Supabase Auth preparado en modo código.
- Fallback backend_stub validado.
- No se han añadido credenciales reales al frontend.

## Cloudflare Pages · Frontend

### Proyecto recomendado

Nombre:

- club-padel-04

### Carpeta de build

- dist

### Comando de build

- npm run build

### Variables públicas permitidas

Solo variables públicas VITE_:

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

## Cloudflare Worker · Backend

Worker:

- cp04-reservas-proxy

Archivo:

- worker-reservas/src/index.js

Config:

- worker-reservas/wrangler.toml

## Secrets privados del Worker

Configurar en Cloudflare Worker, nunca en frontend:

### Reservas / Make / Airtable

- MAKE_RESERVAS_WEBHOOK
- AIRTABLE_TOKEN
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID
- AIRTABLE_RESERVAS_TABLE

### Supabase Auth

- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_PUBLIC_URL

### Futuro

- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET
- EMAIL_PROVIDER_TOKEN
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- WHATSAPP_ACCESS_TOKEN

## Rutas críticas a probar

### Frontend

- /
- Inicio
- Reservar
- Alta de jugador
- Reprogramar reserva
- Cancelar reserva
- Reservas
- Torneos
- Ranking
- Admin
- Centro técnico
- Soporte
- Perfil y ajustes

### Worker reservas

- GET /api/disponibilidad
- POST /api/reservas
- GET /api/reservas
- POST /api/jugadores/alta

### Worker auth

- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/change-password
- OPTIONS /api/auth/login

## Reglas de seguridad

- No exponer claves privadas en `src`.
- No exponer claves privadas en `dist`.
- No usar SERVICE_ROLE_KEY en frontend.
- No confiar solo en localStorage para roles protegidos.
- Admin/Staff/Support deben quedar protegidos por backend real antes de producción pública.
- CORS debe limitarse al dominio final.
- Mantener localhost solo para desarrollo.

## Pendientes antes de producción comercial

- Confirmar dominio final.
- Crear proyecto Supabase real.
- Configurar Supabase Auth.
- Configurar URLs de redirección.
- Configurar secrets reales en Cloudflare Worker.
- Desplegar Worker.
- Desplegar Pages.
- Probar login real.
- Probar reservas reales.
- Probar disponibilidad real.
- Optimizar `dist` pesado.
- Configurar pagos reales si aplica.
- Configurar WhatsApp si aplica.

## Estado Auditoría 23

Esta checklist deja preparada la fase de preproducción para conectar servicios reales sin exponer secretos.
