# Club Pádel 04 · Auditoría 32 · Clasificación de secciones para lazy loading

## Seguras para separar primero

- Galería del club
- Centro técnico
- Soporte técnico
- Panel de dirección / Admin visual
- Ranking visual
- Torneos visual
- Perfil y ajustes visual
- Estado de integraciones
- Listados informativos de flujos

## No separar todavía

- Reservar pista
- Crear reserva
- Cancelar reserva
- Reprogramar reserva
- Consulta real de reservas
- Lógica de autenticación
- Lógica de roles
- Endpoints
- Worker
- Variables de entorno
- Make / Airtable / Supabase

## Estrategia

1. Separar primero componentes puramente visuales.
2. Mantener App.jsx como orquestador.
3. Añadir lazy loading solo a secciones no críticas.
4. Validar build tras cada cambio.
5. No tocar formularios críticos de reserva.

## Objetivo de Auditoría 32

Reducir progresivamente el peso del bundle principal sin romper navegación ni reservas.
