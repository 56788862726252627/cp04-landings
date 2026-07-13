# Club Pádel 04 · Auditoría 34 · Checklist predeploy real seguro

## Estado

Checklist de predeploy preparado.

## Auditoría 34

55%

## Avance real estimado del proyecto completo

86.5%

## Antes de desplegar frontend

- Confirmar que `npm run build` termina correctamente.
- Confirmar que `dist/index.html` existe.
- Confirmar que no hay secretos en `dist`.
- Confirmar que no hay rutas locales duras en `dist`.
- Confirmar que solo se exponen variables `VITE_` públicas.
- Confirmar que los endpoints sensibles pasan por Worker/backend.

## Antes de desplegar Worker

- Confirmar `wrangler.toml`.
- Confirmar `compatibility_date`.
- Confirmar nombre del Worker.
- Confirmar `ALLOWED_ORIGIN`.
- Confirmar secrets reales en Cloudflare, no en frontend.
- Confirmar que Make/Airtable/Supabase/Stripe no reciben datos desde frontend sin proxy seguro.

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
- Secrets.

## Resultado

Predeploy preparado sin publicar nada todavía.

## Riesgo

Bajo.
