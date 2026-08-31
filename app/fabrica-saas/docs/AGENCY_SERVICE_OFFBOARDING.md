# Service Offboarding

**Module**: `maintenance/serviceOffboarding.js`

## Offboarding Checklist (10 steps)

| ID | Step | Critical |
|----|------|---------|
| OFF-01 | Open tickets resolved or handed over | ✓ |
| OFF-02 | Documentation package delivered to client | ✓ |
| OFF-03 | Client credentials transferred | ✓ |
| OFF-04 | Agency access revoked from client systems | ✓ |
| OFF-05 | Data export provided (if applicable) | |
| OFF-06 | Final backup delivered | |
| OFF-07 | Final maintenance report issued | ✓ |
| OFF-08 | Client NPS/feedback collected | |
| OFF-09 | Invoicing closed | ✓ |
| OFF-10 | Internal knowledge base updated | |

## Offboarding States

INITIATED → IN_PROGRESS → PENDING_CLIENT → COMPLETED / CANCELLED

## API

```js
initiateOffboarding({ clientId, serviceId, requestedBy, reason?, targetDate? })
// Returns { valid, errors, offboarding }

completeOffboardingStep(offboarding, stepId, completedBy)
// Returns { valid, offboarding }

endMaintenanceService(offboarding, closedBy)
// Returns { valid, offboarding, summary }
// Fails if any critical steps are pending
```

## Notes
- All 6 critical steps must be completed before `endMaintenanceService()` succeeds.
- Offboarding record is operational documentation, not a legal termination notice.
