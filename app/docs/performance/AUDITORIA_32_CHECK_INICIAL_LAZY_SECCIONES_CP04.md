# Club Pádel 04 · Auditoría 32 · Check inicial lazy loading por secciones

## Objetivo

Preparar lazy loading real por secciones no críticas para reducir el bundle principal.

## Estado inicial

Se parte de Auditoría 31 cerrada al 100%.

## Secciones candidatas

- Galería
- Centro técnico
- Soporte
- Admin
- Ranking
- Torneos
- Perfil y ajustes
- Estado de integraciones
- Módulos visuales pesados no críticos

## Zonas que no se deben tocar

- Reservas
- Crear reserva
- Cancelar reserva
- Reprogramar reserva
- Auth
- Worker
- Make
- Airtable
- Supabase
- Pagos
- Endpoints
- Secrets

## Criterio de éxito

Build correcto y separación progresiva sin romper navegación ni reservas.

## Checkpoint inicial

backups/checkpoint-auditoria32-inicial
