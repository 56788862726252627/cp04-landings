# Dashboards Premium — ADV-07

**isReal:** false | **Módulo:** dashboardExperienceEngine

## Configuración por Vertical/Rol

`buildDashboardConfig(vertical, roles)` devuelve `{ widgets: [...], pattern, isReal }`.

Roles: `ADMIN`, `STAFF`, `USER`, `SUPPORT`

| Widget | Disponible para |
|--------|----------------|
| AGENDA | Todos |
| KPI_CARDS | ADMIN, STAFF |
| CHART | ADMIN |
| RECENT_ACTIVITY | Todos |
| NOTIFICATIONS | Todos |
| QUICK_ACTIONS | Todos |
| CALENDAR_MINI | STAFF, USER |

## Patrones de Dashboard

| Patrón | Vertical típico |
|--------|----------------|
| BOOKING_FIRST | veterinary, dental, physio |
| GALLERY | beauty, hairdresser |
| INFO_DENSE | legal |
| KPI_OVERVIEW | sports, padel (admin) |
| CARD_GRID | general |

## Evaluación de Relevancia

`evaluateDashboardRelevance(vertical, widgets)` → `{ score: 0-100, relevant, expected, isReal }`.

Score < 50 = widgets no alineados con el vertical. Debe superarse antes de producción.

## Límites de Complejidad

- Máximo 8 widgets en vista inicial
- Móvil: máximo 4 widgets visibles sin scroll
- Cada widget tiene un tipo declarado para lazy loading

## Ejemplo

```js
const cfg = buildDashboardConfig('legal', ['ADMIN', 'STAFF']);
// cfg.widgets → [{ type: 'KPI_CARDS' }, { type: 'RECENT_ACTIVITY' }, ...]
const rel  = evaluateDashboardRelevance('legal', cfg.widgets);
// rel.score → 100 (todos relevantes para legal)
```
