# ADV-20 — Production Readiness Reference

## Production Readiness States

| Status | Meaning |
|--------|---------|
| READY | All critical dimensions healthy, no blockers |
| READY_WITH_WARNINGS | Critical dimensions healthy, non-critical warnings present |
| NOT_READY | One or more critical dimensions degraded/critical |
| BLOCKED | One or more dimensions BLOCKED |
| UNKNOWN | Critical dimension signals are stale or missing |

## Critical Dimensions for Production Readiness

All of these must be HEALTHY (or NOT_APPLICABLE) to declare `productionReady: true`:
- SECURITY
- CLIENT_ISOLATION
- PRODUCTION_READINESS
- BACKUPS
- RESTORE
- BUSINESS_TRUTH

## Stale Signal Rule

A stale signal (older than 30 minutes by default) cannot produce `HEALTHY`. The freshness policy sets `trustworthy: false`, and the aggregator treats it as `UNKNOWN` rather than using the last known value. This prevents stale data from falsely reporting production readiness.

## `canDeploy` Flag

The `productionPipelineBridge` always returns `canDeploy: false` and `noRealDeploy: true`. No real deployment is ever triggered by this health system.

## Quality Gate — Production Readiness

The quality gate blocks if `productionReadyWhenBlocked: true`, meaning the dashboard incorrectly reports `productionReady: true` when the aggregator says BLOCKED. This is enforced in `runHealthDashboardQualityGate`.
