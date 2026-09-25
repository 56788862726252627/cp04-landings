# Club Pádel 04 · Variables Supabase Auth

## Variables privadas para Cloudflare Worker

Estas variables se configuran en Cloudflare Worker, no en frontend.

### Obligatorias

SUPABASE_URL
SUPABASE_ANON_KEY
APP_PUBLIC_URL

### Futuras opcionales

SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
JWT_VERIFICATION_KEY
EMAIL_PROVIDER_TOKEN

## Variables públicas frontend permitidas

VITE_CP04_PUBLIC_AUTH_MODE
VITE_CP04_PUBLIC_SITE_URL
VITE_CP04_PUBLIC_BOOKING_ENDPOINT

## Regla

Ninguna clave privada debe aparecer en:

- src/
- dist/
- .env
- .env.production
- variables VITE_ privadas
