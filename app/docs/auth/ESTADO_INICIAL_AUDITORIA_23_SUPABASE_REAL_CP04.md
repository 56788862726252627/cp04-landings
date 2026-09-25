# Estado inicial Auditoría 23 · Conexión real Supabase Auth · Club Pádel 04

## Objetivo

Preparar la conexión real de Supabase Auth en el Worker de reservas de Club Pádel 04.

## Estado heredado de Auditoría 22

La Auditoría 22 dejó el backend Auth preparado, documentado y seguro.

El Worker ya puede activar Supabase real si existen estos secrets:

- SUPABASE_URL
- SUPABASE_ANON_KEY

## Estado actual de secrets Worker

Secrets existentes:

- AIRTABLE_API_KEY
- AIRTABLE_TOKEN
- MAKE_ALTA_JUGADOR_WEBHOOK
- MAKE_RESERVAS_WEBHOOK

Secrets Supabase pendientes:

- SUPABASE_URL
- SUPABASE_ANON_KEY

## Estado actual de la app

La app compila correctamente con Vite.

El frontend usa proxy local `/api` hacia el Worker durante desarrollo.

## Estado actual de Auth

Sin secrets Supabase, el Worker continúa en modo seguro:

- backend_stub
- AUTH_BACKEND_NOT_CONFIGURED

Esto es correcto y esperado.

## Regla de seguridad

No escribir credenciales reales en archivos `.js`, `.md`, `.json`, `.toml` ni documentación.

Las credenciales reales solo deben introducirse mediante:

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY

## Checklist Auditoría 23

1. Crear o confirmar proyecto Supabase.
2. Copiar Project URL.
3. Copiar anon public key.
4. Añadir SUPABASE_URL como secret del Worker.
5. Añadir SUPABASE_ANON_KEY como secret del Worker.
6. Desplegar Worker.
7. Probar /api/auth/me.
8. Probar /api/auth/register.
9. Probar /api/auth/login.
10. Probar /api/auth/forgot-password.
11. Probar /api/auth/logout.
12. Documentar resultados.
13. Cerrar Auditoría 23 solo si login y registro real funcionan.

## Estado

Auditoría 23 iniciada al 10%.
