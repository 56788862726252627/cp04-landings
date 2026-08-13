# Club Pádel 04 · Auditoría 33 · Mapa sección Galería lazy real

## Objetivo

Preparar la conexión real de lazy loading en la sección visual Galería del club.

## Motivo de elección

La Galería es una sección visual no crítica. No debe afectar a:

- Reservas
- Cancelación
- Reprogramación
- Consulta real de reservas
- Auth
- Worker
- Make
- Airtable
- Supabase
- Stripe / pagos
- Endpoints
- Secrets

## Criterio de seguridad

Antes de modificar App.jsx, se documenta:

- Dónde está la sección Galería.
- Si existe ClubGallery.jsx.
- Si existen datos visuales separados.
- Qué imports están activos.
- Qué zonas críticas no deben tocarse.

## Resultado esperado

Build correcto y checkpoint de mapa guardado.

## Siguiente paso

Preparar conexión lazy de ClubGallery con LazyLoadBoundary de forma controlada.
