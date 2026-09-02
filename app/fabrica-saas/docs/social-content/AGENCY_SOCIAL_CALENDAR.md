# Calendario de Contenido Social — ADV-14

## Estados del calendario (7)
IDEA → DRAFT → READY → WAITING_APPROVAL → APPROVED → SCHEDULED_FUTURE → BLOCKED

## Transiciones
`transitionCalendarStatus(entry, newStatus, approver?)` — APPROVED requiere approver

## Evaluación de balance
`evaluateContentCalendarBalance(entries, policy)` detecta:
- PILLAR_IMBALANCE: un pilar > 60% del calendario
- TOO_MANY_PROMOTIONS: promociones > 25%
- CALENDAR_TOO_SPARSE: menos del 70% de posts planificados

## Cadencia (presets)
| Preset | Posts/semana | Días entre posts |
|--------|-------------|-----------------|
| LIGHT | 2 | 2 |
| STANDARD | 4 | 1 |
| HEAVY | 7 | 1 |

## Norma
`noRealSchedule: true` — ningún sistema de programación real se activa.
