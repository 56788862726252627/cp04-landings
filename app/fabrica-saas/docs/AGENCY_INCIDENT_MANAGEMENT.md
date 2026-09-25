# Incident Management

## Severity Levels
| SEV | Impact | Response Target | Owner | Communication |
|-----|--------|----------------|-------|--------------|
| SEV1 | System down, data loss, all users | 15 minutes | AGENCY_OWNER | Immediate + status page |
| SEV2 | Major feature broken, no workaround | 1 hour | PROJECT_MANAGER | Client in 30 min |
| SEV3 | Minor issue, workaround available | 4 hours | SUPPORT | Client in 2 hours |
| SEV4 | Cosmetic, minimal impact | 24 hours | SUPPORT | Next maintenance window |

## Lifecycle
OPEN → CONTAINED → INVESTIGATING → RESOLVED → POSTMORTEM → CLOSED

## Escalation
- SEV1: All hands, AGENCY_OWNER leads
- SEV2: AGENCY_OWNER if unresolved after 2h
- SEV3: PROJECT_MANAGER if unresolved after 8h
- SEV4: PROJECT_MANAGER if unresolved after 72h

## Postmortem
Required for SEV1 and SEV2. Optional for SEV3/SEV4.
Disclaimer: "Post-mortem is a learning document, not a legal liability record."
