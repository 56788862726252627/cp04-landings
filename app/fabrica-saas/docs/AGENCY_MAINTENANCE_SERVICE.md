# Maintenance Service Model

**Module**: `maintenance/maintenanceService.js`

## Purpose
Defines the full configuration of a maintenance service contract for a client. Integrates with `commercial/maintenancePlans.js` for tier defaults.

## Tiers

| Tier | Frequency | P1 Response | Included Hours | Backup |
|------|-----------|------------|----------------|--------|
| BASIC | Monthly | 48h | 2h | Weekly DB |
| PRO | Biweekly | 24h | 5h | Daily DB |
| PRIORITY | Weekly | 4h | 10h | Daily DB + File |

## API

```js
createMaintenanceService({ clientId, tier, packageTier?, ...overrides })
// Returns { valid, errors, service }

getRecommendedMaintenanceTier(packageTier)
// Maps ESSENTIAL→BASIC, PRO→PRO, PREMIUM→PRIORITY
```

## Service Object

```js
{
  id, name, clientId, tier, packageTier,
  includedTasks, excludedTasks,
  frequency, includedHours, responseTargets,
  reviewCadence, reportingCadence,
  backupChecks, securityChecks, dependencyChecks,
  integrationChecks, automationChecks, aiChecks, performanceChecks,
  clientResponsibilities, agencyResponsibilities,
  escalationRules, activeFrom,
  disclaimer: 'Service targets are operational objectives, not legal SLAs.'
}
```

## Notes
- `responseTargets` object: P1_CRITICAL, P2_HIGH, P3_NORMAL, P4_LOW
- PRIORITY tier includes `proactive_monitoring`, `weekly_security_check`, `ai_health_check`
