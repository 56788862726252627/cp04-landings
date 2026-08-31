# Service Targets

**Module**: `maintenance/serviceTargets.js`

**Disclaimer**: Service targets are operational objectives, not legally binding SLAs.

## Base Targets

| Priority | Label | First Response | Resolution | Escalation Trigger |
|----------|-------|---------------|------------|-------------------|
| P1_CRITICAL | System down / data loss | 4h lab. | 24h lab. | 2h sin respuesta |
| P2_HIGH | Critical feature degraded | 8h lab. | 3 days | 1 day |
| P3_NORMAL | Standard incident | 1 day | 5 days | 3 days sin avance |
| P4_LOW | Enhancement / query | 2 days | 10 days | 5 days |

## Tier Overrides

| Tier | P1 First Response | P1 Resolution |
|------|------------------|--------------|
| BASIC | 48h lab. | 5 days |
| PRO | 24h lab. | 3 days |
| PRIORITY | 4h lab. | 24h |

## API

```js
getServiceTarget(priority, maintenanceTier?)
// Returns { valid, priority, maintenanceTier, target, disclaimer }

getAllTargetsForTier(maintenanceTier?)
// Returns array of 4 target objects
```
