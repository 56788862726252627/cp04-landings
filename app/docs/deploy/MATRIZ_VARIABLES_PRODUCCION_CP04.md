# Club Pádel 04 · Matriz de variables producción/preproducción

## Objetivo

Separar claramente variables públicas, variables privadas y secrets reales para evitar filtraciones en frontend o dist.

---

## 1 · Cloudflare Pages · Frontend público

Estas variables pueden estar en Cloudflare Pages porque empiezan por VITE_ y son públicas.

### Obligatorias

VITE_CP04_PUBLIC_AUTH_MODE=production
VITE_CP04_PUBLIC_SITE_URL=https://club-padel-04.pages.dev
VITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas

### Opcionales públicas

VITE_CP04_PUBLIC_CONTACT_EMAIL=
VITE_CP04_PUBLIC_CONTACT_PHONE=
VITE_CP04_PUBLIC_SEO_AREA=
VITE_CP04_PUBLIC_GALLERY_PISTAS=
VITE_CP04_PUBLIC_GALLERY_RECEPCION=
VITE_CP04_PUBLIC_GALLERY_CAFETERIA=
VITE_CP04_PUBLIC_GALLERY_TORNEOS=
VITE_CP04_PUBLIC_GALLERY_INSTALACIONES=

### Regla

Solo información pública, nunca tokens, nunca claves privadas.

---

## 2 · Cloudflare Worker · Variables no secret

Estas pueden estar en wrangler.toml si no son sensibles.

ALLOWED_ORIGIN=https://club-padel-04.pages.dev

Cuando exista dominio final:

ALLOWED_ORIGIN=https://TU-DOMINIO-FINAL.com

---

## 3 · Cloudflare Worker · Secrets privados

Estos deben ir como secrets del Worker.

### Make / Reservas

MAKE_RESERVAS_WEBHOOK

### Airtable

AIRTABLE_TOKEN
AIRTABLE_BASE_ID
AIRTABLE_TABLE_ID
AIRTABLE_RESERVAS_TABLE

### Supabase Auth

SUPABASE_URL
SUPABASE_ANON_KEY
APP_PUBLIC_URL

### Futuros pagos

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

### Futuras notificaciones

WHATSAPP_ACCESS_TOKEN
EMAIL_PROVIDER_TOKEN

### Futuras sesiones propias

SESSION_SECRET
JWT_VERIFICATION_KEY

---

## 4 · Supabase

Configurar dentro del panel Supabase:

### Authentication

- Email provider activo.
- Email/password activo.
- Recuperación de contraseña activa.
- Confirmación de email según decisión.

### URL Configuration

Site URL:

https://club-padel-04.pages.dev

Redirect URLs:

https://club-padel-04.pages.dev
https://club-padel-04.pages.dev/
https://club-padel-04.pages.dev/auth/callback
http://localhost:5173
http://localhost:5173/

Cuando exista dominio final:

https://TU-DOMINIO-FINAL.com
https://TU-DOMINIO-FINAL.com/
https://TU-DOMINIO-FINAL.com/auth/callback

---

## 5 · Prohibido en frontend

No incluir en:

- src/
- dist/
- .env público
- variables VITE_

Los siguientes valores:

SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
JWT_VERIFICATION_KEY
AUTH_CLIENT_SECRET
EMAIL_PROVIDER_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
MAKE_RESERVAS_WEBHOOK
AIRTABLE_TOKEN
WHATSAPP_ACCESS_TOKEN

---

## 6 · Pruebas obligatorias después de configurar variables reales

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me con Bearer token
- POST /api/auth/forgot-password
- POST /api/auth/logout

### Reservas

- POST /api/reservas
- GET /api/disponibilidad
- GET /api/reservas

### Visual

- Login.
- Roles.
- Sidebar.
- Admin.
- Staff.
- Soporte.
- Perfil.

---

## Estado

Matriz lista para preparar preproducción real sin exponer secretos.
