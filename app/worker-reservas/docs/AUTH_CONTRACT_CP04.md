# Club Pádel 04 · Auth Contract Proxy/Worker

## Objetivo
Definir una capa de autenticación delegada en Proxy/Worker antes de integrar reservas experimentales.

## Endpoints previstos
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/session
- GET /api/auth/role-check
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

## Roles
- PLAYER
- STAFF
- ADMIN
- SUPPORT

## Reglas de seguridad
- No guardar tokens sensibles en localStorage.
- No devolver password, passwordHash, refresh_token ni access_token al frontend.
- Validar roles en Worker, no solo en React.
- Usar cookies HttpOnly/Secure/SameSite o mecanismo equivalente.
- No exponer PII de terceros ni notas internas.

## Criterio de desbloqueo
La UI experimental de reservas solo podrá integrarse cuando login, session y role-check estén operativos en Worker.
