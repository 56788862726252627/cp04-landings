# Club Pádel 04 · Auditoría 31 · Propuesta de conexión galería

## Estado

El componente `src/components/ClubGallery.jsx` existe y compila.

## Objetivo del siguiente paso

Conectar `ClubGallery` dentro de `App.jsx` sustituyendo únicamente el bloque visual de galería.

## Estrategia segura

1. Añadir import normal o lazy import.
2. Sustituir solo el bloque visual de galería por `<ClubGallery />`.
3. Mantener intactas todas las zonas críticas.
4. Ejecutar build.
5. Comprobar visualmente localhost:5173.
6. Guardar checkpoint final si todo se ve igual.

## Zonas prohibidas

No tocar:

- Reservas
- Crear reserva
- Cancelar reserva
- Reprogramar reserva
- Auth
- Roles
- Worker
- Make
- Airtable
- Supabase
- Pagos
- Notificaciones
- Calendario
- Endpoints
- Secrets

## Criterio de éxito

La galería debe verse igual o mejor, y el build debe seguir correcto.

## Criterio de rollback

Si cambia la navegación, desaparece la galería o falla el build, restaurar:

`backups/checkpoint-auditoria31-preconexion-galeria/App.jsx`
