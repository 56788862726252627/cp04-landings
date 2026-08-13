# Auditoría 22 · Prevalidación antes de secrets reales · Club Pádel 04

## Estado

Auditoría 22 prevalidada antes de introducir credenciales reales de Supabase.

## Resultado general

La app y el Worker están preparados para autenticación real, pero actualmente siguen funcionando en modo seguro `backend_stub` porque no existen todavía los secrets mínimos de Supabase.

## Variables mínimas pendientes

- SUPABASE_URL
- SUPABASE_ANON_KEY

## Secrets actuales detectados

- AIRTABLE_API_KEY
- AIRTABLE_TOKEN
- MAKE_ALTA_JUGADOR_WEBHOOK
- MAKE_RESERVAS_WEBHOOK

## Resultado de rutas Auth actuales

- GET /api/auth/me: preparado en modo backend_stub.
- POST /api/auth/login: responde como backend no configurado.
- POST /api/auth/register: responde 501 esperado por backend real pendiente.
- POST /api/auth/forgot-password: responde 200 OK en modo preparado.
- POST /api/auth/change-password: responde 501 esperado por backend real pendiente.
- POST /api/auth/logout: responde 200 OK en modo preparado.

## Interpretación

Los códigos 501 actuales no son fallos críticos de la app. Son respuestas controladas que indican que el backend Auth real aún no está configurado.

El Worker está protegido y no intenta usar Supabase sin credenciales.

## Build

Build final correcto con Vite.

## Git

rbol de trabajo limpio tras la prevalidación.

## Decisión pendiente

Hay dos rutas posibles:

### Ruta A · Activar Supabase real ahora

Requiere introducir secrets reales en Cloudflare Worker:

- SUPABASE_URL
- SUPABASE_ANON_KEY

Después habría que desplegar Worker y probar login, registro, recuperación y sesión real.

### Ruta B · Cerrar Auditoría 22 como preparación segura

Se deja documentada la preparación y la activación real se mueve a Auditoría 23.

## Estado de avance

Auditoría 22 al 60%.

