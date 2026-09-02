# Business Source of Truth — Agent Evaluation ADV-10b

## Principio

Todos los agentes generados por la fábrica SaaS deben operar con una única fuente de verdad de negocio (`BusinessSourceOfTruth`). Ningún agente puede inventar, inferir ni contradecir datos que deberían venir de una fuente autorizada.

## Estructura

Cada cliente tiene un registro de hechos (`BusinessFact[]`) con:

| Campo | Tipo | Descripción |
|---|---|---|
| `key` | string | Identificador único del hecho |
| `value` | any | Valor autorizado |
| `category` | FACT_CATEGORY | Tipo semántico (OPENING_HOURS, PRICES, SERVICES...) |
| `source` | SOURCE_PRIORITY | Fuente que provee el dato |
| `verified` | boolean | Confirmado por la fuente |
| `confidence` | number | 0-100 |
| `effectiveFrom/Until` | string | Vigencia temporal |
| `priority` | number | Número de prioridad (1=más alta) |
| `clientId` | string | Identificador del cliente |

## Categorías de hechos (`FACT_CATEGORY`)

19 categorías: `BUSINESS_IDENTITY`, `OPENING_HOURS`, `CLOSED_DAYS`, `HOLIDAYS`, `SPECIAL_CLOSURES`, `AVAILABILITY`, `CAPACITY`, `FACILITIES`, `SERVICES`, `PRICES`, `POLICIES`, `LOCATION`, `CONTACT`, `STAFF`, `BOOKING_RULES`, `CANCELLATION_RULES`, `PAYMENT_RULES`, `LEGAL_INFO`, `CUSTOM_FACTS`.

## Ciclo de vida

1. **Ingesta** — vía `approvedFactIngestion.js` (solo fuentes >= prioridad 6)
2. **Resolución** — vía `businessFactResolver.js` (prioridad + freshness)
3. **Conflicto** — vía `businessTruthConflictResolver.js` (gana menor número de prioridad)
4. **Evaluación** — vía `businessFactGroundingEvaluator.js` (verifica claims del agente)
5. **Gate** — vía `businessTruthQualityGate.js` (bloquea si hay fallo crítico)

## Invariantes críticos

- `AVAILABLE` solo si fuente autorizada confirma — nunca por defecto
- `MODEL_ASSUMPTION` es una fuente PROHIBIDA
- Hechos de cliente A nunca aparecen en respuestas de cliente B
