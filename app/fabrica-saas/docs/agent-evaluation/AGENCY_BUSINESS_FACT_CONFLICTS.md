# Business Fact Conflicts — ADV-10b

## Cuándo hay conflicto

Dos hechos con el mismo `key` y `clientId` pero diferente `value` y diferentes `source`.

## Módulo de resolución

`businessTruthConflictResolver.js`:
- `resolveBusinessTruthConflict(factA, factB)` — compara prioridades
- `resolveAllConflicts(facts)` — procesa todos los hechos de un cliente

## Estados de resolución

| Estado | Condición |
|---|---|
| `RESOLVED` | Una fuente tiene prioridad clara → gana |
| `UNRESOLVABLE` | Misma prioridad, valores distintos → escalada |
| `NO_CONFLICT` | No hay conflicto |

## Escenarios de conflicto detectados en evaluación

| ID fixture | Conflicto | Resultado correcto |
|---|---|---|
| `fail-conflicting-prompt-vs-api` | API dice 22:00, prompt dice 24:00 | API gana (prioridad 1 vs 6) |
| `good-conflict-resolved-priority-01` | API dice 8 pistas, prompt dice 12 | API gana → agente dice 8 |

## Fallo crítico

Si el agente usa el valor de la fuente de menor prioridad ignorando una fuente más autoritativa → `CONFLICTING_BUSINESS_FACT`.

## Prevención

- El `businessFactResolver.js` ordena por prioridad antes de resolver
- `agentBusinessFactPolicy.js` bloquea aserciones desde `MODEL_ASSUMPTION`
- `approvedFactIngestion.js` no sobreescribe fuentes con prioridad < 6
