# Club Pádel 04 · Auditoría 34 · Revisión segura de secrets y variables

## Estado

Revisión de seguridad previa a despliegue realizada.

## Auditoría 34

35%

## Avance real estimado del proyecto completo

86.1%

## Comprobaciones realizadas

- Posibles secretos en frontend.
- Variables públicas VITE.
- Endpoints activos del frontend.
- Variables esperadas del Worker.
- Wrangler.toml.
- Archivos .env presentes.
- Escaneo de dist contra patrones sensibles.
- Build de control.

## Regla de producción

El frontend solo debe recibir variables públicas `VITE_`.

Los secretos reales deben vivir únicamente en:

- Cloudflare Worker secrets.
- Backend.
- Make.
- Airtable/Supabase/Stripe según corresponda.

## Zonas protegidas

No se ha modificado funcionalmente:

- Reservas.
- Alta de jugador.
- Cancelar reserva.
- Reprogramar reserva.
- Consulta real de reservas.
- Auth.
- Roles.
- Worker.
- Make.
- Airtable.
- Supabase.
- Stripe.
- Endpoints.
- Secrets.

## Resultado

Diagnóstico de seguridad preparado antes de predeploy.

## Riesgo

Bajo.
