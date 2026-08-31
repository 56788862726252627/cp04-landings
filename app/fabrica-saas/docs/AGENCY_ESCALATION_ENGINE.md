# Escalation Engine

**Module**: `maintenance/escalationEngine.js`

## Escalation Levels (5)

| Level | Label | Escalates To | Trigger |
|-------|-------|-------------|---------|
| NONE | No Escalation | — | P3/P4 within SLA |
| LEVEL_1 | Project Manager | PROJECT_MANAGER | P1 just opened; P2 > 24h |
| LEVEL_2 | Agency Owner | AGENCY_OWNER | P1 > 4h; P2 > 48h |
| LEVEL_3 | Emergency Protocol | AGENCY_OWNER | P1 already escalated + > 24h |
| CRITICAL | All Hands | AGENCY_OWNER | SECURITY_CONCERN + P1 |

## Evaluation Rules

```
SECURITY + P1 → CRITICAL
P1 escalated > 24h open → LEVEL_3
P1 open > 4h → LEVEL_2
P1 just created → LEVEL_1
P2 > 48h → LEVEL_2
P2 > 24h → LEVEL_1
P3 > 120h → LEVEL_1
else → NONE
```

## API

```js
evaluateEscalation(ticket, context?)
// context: { hoursOpen }
// Returns { valid, escalationLevel, escalateTo, action, label, reasons }

getEscalationDefinition(level)
// Returns { label, escalateTo, action }
```
