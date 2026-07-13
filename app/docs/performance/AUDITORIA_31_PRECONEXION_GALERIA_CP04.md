# Club Pádel 04 · Auditoría 31 · Preconexión galería

## Estado

Auditoría 31 avanzada al 65% si el build termina correctamente.

## Objetivo

Preparar la conexión segura del componente ClubGallery sin modificar todavía la lógica crítica.

## Archivos preparados

- src/components/ClubGallery.jsx
- src/data/visualAssets.js

## Archivos analizados

- src/App.jsx
- src/index.css
- src/cp04-legibility-polish.css

## Regla de seguridad

Antes de conectar el componente, se localizan:

- imports actuales
- bloque exacto de galería
- sistema de navegación/secciones
- rutas visuales activas

## No tocar

- Reservas
- Auth
- Worker
- Make
- Airtable
- Supabase
- Pagos
- Notificaciones
- Calendario

## Próximo paso

Conexión controlada de ClubGallery mediante import normal o lazy import, según acoplamiento detectado.
