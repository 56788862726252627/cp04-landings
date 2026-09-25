# Estado inicial Auditoría 25 · Validación visual sesión real · Club Pádel 04

## Punto de partida

La Auditoría 24 quedó cerrada al 100%.

## Base técnica disponible

- Worker Cloudflare con Supabase Auth real activo.
- `/api/auth/login` funcionando.
- `/api/auth/me` funcionando con Bearer token.
- Frontend conectado a `/api/auth/login`.
- Frontend guarda `cp04_access_token`.
- Frontend guarda `cp04_refresh_token`.
- Frontend restaura sesión al recargar.
- Frontend limpia sesión al cerrar sesión.

## Objetivo Auditoría 25

Validar desde interfaz visual que la autenticación real funciona correctamente en flujo completo:

1. Login real.
2. Persistencia tras recarga.
3. Restauración de rol.
4. Limpieza completa al cerrar sesión.
5. Estado visual correcto.
6. Sin regresión a modo demo.

## Estado inicial

Auditoría 25 iniciada.
