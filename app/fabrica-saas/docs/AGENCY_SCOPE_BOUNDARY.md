# Scope Boundary

**Module**: `maintenance/scopeBoundary.js`

Classifies incoming client requests as covered or billable.

## Decision Categories

| Category | Decision | Examples |
|----------|----------|---------|
| BUG_FIX | INCLUDED | "bug", "broken", "error", "crash", "not working" |
| INCLUDED_SUPPORT | INCLUDED | "question", "how to", "access", "password" |
| MAINTENANCE_TASK | INCLUDED | "security patch", "certificate", "ssl", "backup" |
| CHANGE_REQUEST | BILLABLE | "change", "modify", "update design", "add field" |
| NEW_FEATURE | BILLABLE | "new feature", "new module", "build", "develop" |
| OUT_OF_SCOPE | EXCLUDED | "legal advice", "accounting", "marketing campaign" |

## Decision Outcomes

- **INCLUDED**: Covered by maintenance agreement — proceed
- **BILLABLE**: Requires new scope + quotation
- **ESCALATE**: Pattern unclear — PM review required
- **EXCLUDED**: Explicitly out of scope

## API

```js
classifyScopeRequest({ description, title?, estimatedHours?, includedHoursRemaining? })
// Returns {
//   valid, category, decision, reason,
//   includedInTier, requiresQuote, recommendation
// }
```

## Notes
- Hours check: if estimated hours > remaining included hours, INCLUDED → BILLABLE
- Unrecognized requests → ESCALATE for PM review
