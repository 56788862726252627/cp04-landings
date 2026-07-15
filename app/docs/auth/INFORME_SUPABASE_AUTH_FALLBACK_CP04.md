# Club Pádel 04 · Auditoría 22 · Informe Supabase Auth fallback

## Estado

La integración de Supabase Auth ha sido preparada en el Worker `worker-reservas/src/index.js`.

## Cambios realizados

- Añadidos helpers Supabase Auth.
- Añadida detección de credenciales:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
- Adaptadas rutas `/api/auth/*` para usar Supabase si hay credenciales.
- Mantenido fallback seguro `backend_stub` si faltan credenciales.

## Endpoints preparados

- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/change-password
- OPTIONS /api/auth/*

## Resultado del test sin credenciales

Sin `SUPABASE_URL` y `SUPABASE_ANON_KEY`, el Worker responde en modo seguro:

- `/api/auth/me`: responde en modo backend_stub.
- `/api/auth/login`: responde AUTH_BACKEND_NOT_CONFIGURED.
- `/api/auth/register`: responde AUTH_BACKEND_NOT_CONFIGURED.
- `/api/auth/forgot-password`: responde mensaje seguro.
- `/api/auth/change-password`: responde AUTH_BACKEND_NOT_CONFIGURED.
- `OPTIONS /api/auth/login`: responde 204.

## Validaciones

- `node --check worker-reservas/src/index.js`: correcto.
- `npm run build`: correcto.
- Frontend estable.
- Reservas no modificadas.
- Disponibilidad no modificada.

## Conclusión

La arquitectura ya está preparada para conectar Supabase Auth real cuando existan credenciales reales en Cloudflare Worker.

## Pendiente

- Crear proyecto Supabase.
- Obtener SUPABASE_URL.
- Obtener SUPABASE_ANON_KEY.
- Configurar redirect URLs.
- Configurar emails de recuperación.
- Guardar variables/secrets en Cloudflare Worker.
- Probar login real con usuario real.
