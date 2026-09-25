# Club Pádel 04 · Auditoría 25 · Check inicial Cloudflare real seguro

## Objetivo

Preparar Cloudflare real sin exponer credenciales ni ejecutar acciones irreversibles.

## Estado de partida

- Auditoría 23 cerrada: preproducción Cloudflare + Supabase preparada.
- Auditoría 24 cerrada: E2E/deploy real preparado.
- Frontend estable.
- Worker presente.
- Wrangler presente.
- Build correcto.
- Deploy real pendiente.
- Secrets reales pendientes.

## Validaciones del check inicial

- Ruta del proyecto.
- Archivos principales.
- Build frontend.
- Dist generado.
- Wrangler enmascarado.
- Scripts relacionados con deploy.
- Docs previas localizadas.
- Búsqueda segura de patrones sensibles.

## Regla

No introducir credenciales reales en frontend, src, dist ni variables VITE privadas.

## Pendiente

- Crear checklist de Cloudflare real.
- Crear guía de secrets manuales.
- Preparar comandos de deploy controlado.
- Validar CORS/dominio final.
