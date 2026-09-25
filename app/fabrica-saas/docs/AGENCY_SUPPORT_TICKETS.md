# Support Ticket System

**Modules**: `maintenance/supportTicket.js`, `maintenance/triageEngine.js`, `maintenance/supportQueue.js`

## Ticket Types (12)

| Type | Auto-Priority | Assignee |
|------|--------------|---------|
| BUG_REPORT | P3 (P1 if "production/down/all users") | SUPPORT / PROJECT_MANAGER |
| SECURITY_CONCERN | P1 | AGENCY_OWNER |
| INTEGRATION_ISSUE | P2 | DEVELOPER |
| DATA_ISSUE | P2 | DEVELOPER |
| PERFORMANCE_ISSUE | P2 | DEVELOPER |
| CHANGE_REQUEST | P3 | PROJECT_MANAGER |
| FEATURE_REQUEST | P4 | SUPPORT |
| TRAINING_REQUEST | P4 | SUPPORT |
| QUESTION | P3 (default) | SUPPORT |
| ACCESS_REQUEST | P3 | SUPPORT |
| BILLING_INQUIRY | P3 | SUPPORT |
| OFFBOARDING_REQUEST | P3 | PROJECT_MANAGER |

## Ticket States (9)

OPEN → TRIAGED → IN_PROGRESS → WAITING → ESCALATED → ON_HOLD → RESOLVED → CLOSED / REJECTED

## Support Queue (8 functions)

1. `createTicket(params)` — Creates + auto-triages
2. `assignTicket(id, assignTo, by)` — Update assignee
3. `updateTicket(id, newState, by, note)` — State change
4. `escalateTicket(id, by, reason)` — Set ESCALATED
5. `resolveTicket(id, by, resolution)` — Set RESOLVED
6. `closeTicket(id, by, note)` — Set CLOSED
7. `listTickets(filters)` — Query with clientId/state/priority/type
8. `getQueueSummary(clientId)` — Counts by state + priority

## Triage Rules

Triage is automatic on `createTicket()`. Security → P1. Production bug → P1. Integration/Data/Performance → P2. Feature/Training → P4. All others → P3.
