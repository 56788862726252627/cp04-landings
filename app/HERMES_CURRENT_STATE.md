# HERMES_CURRENT_STATE.md

## Estado del Repositorio
- **Rama:** `checkpoint/fase-11-rama-limpia-cp04` (ahead 2)
- **Modificaciones:** 14 archivos modificados (Frontend, Auth, Worker).
- **Untracked:** Amplia estructura de docs, fixtures, schemas y tests, indicando una preparación avanzada pero sin integrar.
- **Contexto:** Enfoque en optimización, lazy-loading y corrección de métricas en Centro Técnico.

## Áreas en Progreso
- **Centro Técnico:** Auditoría de métricas y estados de conexión (evitando falsos positivos).
- **Auth/RBAC:** Refuerzo de aislamiento multi-tenant y roles.
- **Worker:** Observabilidad y manejo de webhooks (Stripe).

## Riesgos de Solapamiento
- **Alta actividad en `worker-reservas` y `src/auth/`:** Riesgo de tocar lógica sensible de aislamiento de datos si no se respeta `tenant_id`.
- **Conflicto confirmado 2026-07-11:** `worker-reservas/src/index.js` cambió externamente durante este bloque y ahora incorpora trabajo T5 de cookies HttpOnly/CSRF (`session-cookie.js`). No tocar el Worker hasta coordinación/liberación explícita.

## Alcance Seguro
- **SÍ:** Auditoría de contratos, refactorización de lógica de estado (ej: métricas), adición de tests y documentación.
- **NO:** Modificar secretos, realizar despliegues, o simular conexiones de servicios externos que no están activos.
