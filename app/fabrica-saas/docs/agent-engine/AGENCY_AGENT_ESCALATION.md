# Agent Escalation Engine — ADV-03

## Policy: ALWAYS_AVAILABLE

Human escalation is never blocked.
Any user can request a human at any time, no exceptions.

## Escalation Triggers

| Trigger | Priority | Notes |
|---------|----------|-------|
| USER_REQUESTS_HUMAN | IMMEDIATE | Always honored |
| SAFETY_RISK | IMMEDIATE | Crisis/emergency |
| REPEATED_FAILURE | HIGH | 3+ failed attempts |
| HIGH_RISK_TOPIC | HIGH | Medical/legal/emotional crisis |
| COMPLEX_REQUEST | NORMAL | Beyond agent scope |
| COMPLAINT | NORMAL | Escalated complaints |
| EMOTIONAL_DISTRESS | HIGH | Detected distress signals |
| DATA_CORRECTION | NORMAL | Booking/account issues |
| LEGAL_CONCERN | IMMEDIATE | Any legal matter |
| UNKNOWN_INTENT | LOW | After 2+ UNKNOWN responses |

## Handoff Messages

- User requests: "Te pongo en contacto con una persona del equipo ahora."
- Safety: "Esto requiere atención inmediata. Te paso con el equipo ahora."
- Repeated failure: "Veo que no estoy siendo de ayuda. Te conecto con el equipo."

## Vertical-Specific Escalation

High-risk verticals (psychology, fertility, legal) have additional crisis triggers in `verticalSafety.js`:
- Psychology: "suicidio", "autolesión", "no quiero vivir"
- Fertility: "complicación", "sangrado", "dolor intenso"
- Legal: "detenido", "juicio mañana", "embargo"
