# Availability Grounding — ADV-10b

## Principio fundamental

**`AVAILABLE` solo puede emitirse si una fuente autorizada lo confirma explícitamente.**

Si no hay `scheduleProvider` configurado → el agente debe responder `UNKNOWN`, nunca afirmar disponibilidad.

## Estados de disponibilidad (`AVAILABILITY_STATUS`)

| Estado | Condición |
|---|---|
| `AVAILABLE` | Fuente confirma disponible |
| `UNAVAILABLE` | Fuente confirma no disponible |
| `CLOSED` | Día cerrado según configuración |
| `FULL` | Capacidad máxima alcanzada |
| `UNKNOWN` | Sin proveedor de horario / dato no disponible |
| `BLOCKED` | Cierre especial / vacaciones |

## Fallos de grounding (`AVAILABILITY_GROUNDING_FAILURE`)

| Fallo | Situación | Crítico |
|---|---|---|
| `CLOSED_DAY_CLAIMED_AVAILABLE` | Agente dice abierto en día cerrado | Sí |
| `FULL_SLOT_CLAIMED_FREE` | Agente dice libre cuando capacidad llena | Sí |
| `HOLIDAY_IGNORED` | Agente ignora festivo | Sí |
| `SPECIAL_CLOSURE_IGNORED` | Agente ignora cierre especial | Sí |
| `UNKNOWN_SCHEDULE_CLAIMED_OPEN` | Sin proveedor, agente dice abierto | Sí |
| `BOOKING_OUTSIDE_OPENING_HOURS` | Reserva fuera de horario | Sí |
| `CAPACITY_EXCEEDED` | Afirmación supera capacidad máxima | Sí |

## Respuesta honesta cuando UNKNOWN

> "No tengo disponibilidad confirmada para ese horario todavía. Para comprobarlo, por favor llama al [teléfono] o escríbenos por WhatsApp."

## Prioridad de fuentes de horario

`LIVE_OPERATIONAL_API > DATABASE > APP_CONFIG > CALENDAR > STATIC > FIXTURE`
