# Auditoría 23 · Supabase Auth real activo en Worker remoto · Club Pádel 04

## Objetivo

Confirmar que el Worker remoto `cp04-reservas-proxy` deja de funcionar en modo `backend_stub` y empieza a usar Supabase Auth real.

## Secrets configurados en Cloudflare Worker

Confirmados por nombre, sin exponer valores:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- AIRTABLE_API_KEY
- AIRTABLE_TOKEN
- MAKE_ALTA_JUGADOR_WEBHOOK
- MAKE_RESERVAS_WEBHOOK

## Worker remoto probado

- https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev

## Origin probado

- https://club-padel-04.pages.dev

## Resultado GET /api/auth/me

Respuesta esperada y confirmada:

- HTTP 401
- ok: false
- auth_ready: true
- provider: supabase
- error: MISSING_BEARER_TOKEN
- mensaje: Falta Authorization Bearer token.

Interpretación:

El backend de autenticación real está activo. La ruta `/api/auth/me` ya no devuelve usuario demo y exige token real de sesión.

## Resultado POST /api/auth/logout

Respuesta esperada y confirmada:

- HTTP 200
- ok: true
- auth_ready: true
- provider: supabase
- mensaje: Sesión local cerrada. No había token Bearer que invalidar.

Interpretación:

La ruta de logout remoto está preparada para Supabase real.

## Build

Build Vite correcto tras el deploy del Worker.

## Estado

Supabase Auth real activado correctamente a nivel Worker remoto.

## Pendiente

- Probar registro real.
- Probar login real.
- Probar recuperación de contraseña.
- Probar cambio de contraseña con token válido.
- Validar roles PLAYER, STAFF, ADMIN y SUPPORT.
- Confirmar que el frontend consume correctamente `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/logout` y `/api/auth/me`.
