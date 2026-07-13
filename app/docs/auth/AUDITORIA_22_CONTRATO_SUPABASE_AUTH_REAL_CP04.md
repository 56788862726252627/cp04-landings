# Auditoría 22 · Contrato Supabase/Auth real · Club Pádel 04

## Estado inicial

Auditoría 22 iniciada.

La app y el Worker tienen rutas de autenticación preparadas, pero el backend real de Auth todavía no está activado.

## Estado heredado

- Auditoría 8: 100% terminada.
- Auditoría 9: 100% terminada.
- Auditoría 21: 90% cerrada como backend Auth preparado.

## Secrets actuales detectados en Cloudflare Worker

- AIRTABLE_API_KEY
- AIRTABLE_TOKEN
- MAKE_ALTA_JUGADOR_WEBHOOK
- MAKE_RESERVAS_WEBHOOK

## Secrets Auth pendientes

Para activar autenticación real se deberán configurar, como mínimo:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE

Y, si el backend lo requiere para sesiones avanzadas:

- AUTH_PROVIDER
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- EMAIL_PROVIDER_TOKEN

## Rutas Auth preparadas

- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/change-password
- POST /api/auth/logout

## Criterios para cerrar Auditoría 22 al 100%

1. Configurar proveedor real Supabase Auth.
2. Añadir secrets reales en Cloudflare Worker sin escribirlos en Git.
3. Verificar que los secrets existen con `wrangler secret list`.
4. Desplegar Worker.
5. Probar login real.
6. Probar registro real.
7. Probar recuperación de contraseña real.
8. Probar logout real.
9. Probar /api/auth/me con sesión/token real.
10. Validar roles PLAYER, STAFF, ADMIN y SUPPORT.
11. Confirmar que no hay secrets en frontend.
12. Confirmar build correcto.
13. Confirmar Git limpio.

## Regla de seguridad

No se deben escribir secrets reales en archivos versionados.

Los secrets se deben introducir únicamente mediante:

- `npx wrangler secret put NOMBRE_SECRET`

## Estado actual de Auditoría 22

Auditoría 22 al 20%, en fase de preparación y contrato técnico.
