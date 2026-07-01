# Club Pádel 04 · Guía Supabase Auth + Cloudflare Worker

## Objetivo

Conectar autenticación real usando Supabase Auth sin exponer credenciales privadas en el frontend.

## Estado actual

El Worker ya está preparado para usar Supabase Auth si existen estas variables:

- SUPABASE_URL
- SUPABASE_ANON_KEY

Si no existen, el Worker mantiene modo seguro `backend_stub`.

## Paso 1 · Crear proyecto Supabase

1. Entrar en Supabase.
2. Crear nuevo proyecto.
3. Guardar:
   - Project URL
   - anon public key

## Paso 2 · Configurar Authentication

En Supabase:

Authentication → Providers:

- Activar Email.
- Permitir login con email/password.
- Configurar confirmación de email según decisión comercial.

Recomendación inicial:

- Para pruebas internas: email confirmation desactivado temporalmente.
- Para producción real: email confirmation activado.

## Paso 3 · Configurar redirect URLs

En Supabase:

Authentication → URL Configuration

Configurar:

- Site URL:
  https://club-padel-04.pages.dev

Redirect URLs recomendadas:

- https://club-padel-04.pages.dev
- https://club-padel-04.pages.dev/
- https://club-padel-04.pages.dev/auth/callback
- http://localhost:5173
- http://localhost:5173/

Cuando exista dominio final, añadir también:

- https://TU-DOMINIO-FINAL.com
- https://TU-DOMINIO-FINAL.com/auth/callback

## Paso 4 · Variables privadas en Cloudflare Worker

En Cloudflare Worker `cp04-reservas-proxy`, configurar variables/secrets.

Variables necesarias:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_PUBLIC_URL

Ejemplo conceptual:

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=ey...
APP_PUBLIC_URL=https://club-padel-04.pages.dev

## Paso 5 · No poner secretos en frontend

No poner en `.env`, `.env.production` ni variables VITE_:

- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- AUTH_CLIENT_SECRET
- EMAIL_PROVIDER_TOKEN

El frontend solo debe usar variables públicas no sensibles.

## Paso 6 · Pruebas reales cuando haya credenciales

Probar:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me con Bearer token
- POST /api/auth/forgot-password
- POST /api/auth/logout

## Paso 7 · Roles

Rol inicial recomendado:

- PLAYER

Roles futuros:

- PLAYER
- STAFF
- ADMIN
- SUPPORT

El rol podrá venir de:

- user_metadata.role
- app_metadata.role
- tabla propia `profiles`

Recomendación para producción:

Crear tabla `profiles` con:

- id uuid vinculado a auth.users
- email
- nombre
- telefono
- role
- created_at
- updated_at

## Paso 8 · Seguridad mínima para producción

Antes de exponer Admin/Staff/Support:

- Validar token en Worker.
- Leer rol real desde backend.
- No confiar solo en localStorage.
- Bloquear rutas protegidas desde backend.
- Registrar errores de auth.
- Activar recuperación de contraseña real.
- Revisar CORS con dominio final.

## Estado de esta guía

Preparada para ejecutar configuración real de Supabase y Cloudflare Worker en la siguiente fase.
