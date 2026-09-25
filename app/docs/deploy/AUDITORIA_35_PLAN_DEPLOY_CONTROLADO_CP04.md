# Club Pádel 04 · Auditoría 35 · Plan deploy controlado Pages + Worker

## Estado

Plan de despliegue preparado sin publicar.

## Auditoría 35

75%

## Avance real estimado del proyecto completo

88.8%

## Frontend · Cloudflare Pages

Configuración recomendada:

- Framework: Vite
- Build command: npm run build
- Output directory: dist
- Root directory: app, si el repositorio contiene más carpetas
- Deploy automático: desactivado al principio si es posible
- Preview primero antes de producción

## Worker · Cloudflare Workers

Antes de desplegar:

- Confirmar nombre final del Worker.
- Confirmar wrangler.toml.
- Confirmar main del Worker.
- Configurar secrets reales en Cloudflare.
- Configurar ALLOWED_ORIGIN con el dominio final de Pages.
- Validar CORS.
- Validar endpoint público final.

## Variables privadas

Deben ir en Cloudflare Worker, no en frontend:

- RESERVAS_WEBHOOK
- DB_API_KEY
- DB_BASE_ID
- DB_RESERVAS_TABLE
- PAGOS_CLAVE_PRIVADA
- PAGOS_FIRMA_WEBHOOK
- MESSAGING_PROVIDER_TOKEN
- MESSAGING_PHONE_NUMBER_ID
- CALENDAR_CREDENTIALS
- STORAGE_CREDENTIALS
- AUTH_PROVIDER
- AUTH_ISSUER_URL
- AUTH_AUDIENCE

## Variables públicas

Solo usar variables VITE_ no sensibles.

## Orden seguro recomendado

1. Confirmar build local.
2. Crear proyecto Cloudflare Pages.
3. Subir frontend en modo preview.
4. Crear Worker.
5. Configurar secrets.
6. Configurar ALLOWED_ORIGIN.
7. Probar reservas sin pagos reales.
8. Probar alta de jugador.
9. Probar cancelar/reprogramar.
10. Probar consulta de reservas.
11. Revisar logs.
12. Activar producción solo cuando todo esté validado.

## Estado de publicación

No publicado todavía.

## Riesgo

Bajo.
