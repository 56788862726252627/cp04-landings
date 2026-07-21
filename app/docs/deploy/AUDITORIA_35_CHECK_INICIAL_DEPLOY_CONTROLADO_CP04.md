# Club Pádel 04 · Auditoría 35 · Check inicial deploy controlado Cloudflare

## Estado

Check inicial de despliegue controlado preparado.

## Auditoría 35

15%

## Avance real estimado del proyecto completo

87.6%

## Objetivo

Preparar el despliegue controlado en Cloudflare Pages y Worker sin publicar todavía ni tocar producción real.

## Validaciones realizadas

- Backup inicial.
- Build inicial.
- Revisión de package.json.
- Revisión de vite.config.js.
- Revisión de dist.
- Revisión de Worker.
- Revisión de wrangler.toml.
- Revisión de referencias de despliegue.
- Revisión de posibles secretos antes de deploy.

## Decisión

Todavía no publicar.

Primero debe confirmarse:

- Proyecto final en Cloudflare Pages.
- Nombre final del Worker.
- Dominio/subdominio final.
- ALLOWED_ORIGIN.
- Variables públicas VITE.
- Secrets reales en Cloudflare.
- Endpoint final de reservas.
- Prueba local final.

## Zonas protegidas

No se modifica funcionalmente:

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
- Secrets.

## Riesgo

Bajo.
