# ADV-20 — Health Alerts Reference

## Alert Types (10)

1. `CRITICAL_STATUS` — status becomes CRITICAL
2. `BLOCKED_STATUS` — status becomes BLOCKED
3. `SCORE_DROP` — significant score decrease
4. `PRODUCTION_READINESS_CHANGED` — production readiness changes
5. `SECURITY_VIOLATION` — security dimension becomes CRITICAL/BLOCKED
6. `CLIENT_ISOLATION_BREACH` — cross-client leakage detected
7. `BACKUP_STALE` — backup exceeds freshness threshold
8. `SLO_BREACH` — SLO breached
9. `RECOVERY_CONFIRMED` — health recovered after incident
10. `TREND_CRITICAL_DEGRADATION` — rapid score decline detected

## Guardrails

- `sent: false` on every alert — NO real alert is dispatched
- `noRealAlertSend: true` on alert policy
- Cooldowns prevent alert storms (SECURITY/CLIENT_ISOLATION: cooldown=0 always; BACKUP: 1hr)

## Deduplication

`deduplicateAlerts(alerts)` uses a Map keyed by `dedupKey` (alertType + dimension). Within a 15-minute window, duplicate alerts are suppressed. Returns: `{ unique: Alert[], deduplicatedCount: number }`.

## Alert Policy Cooldowns

| Alert Type | Cooldown |
|-----------|----------|
| SECURITY_VIOLATION | 0ms (always fires) |
| CLIENT_ISOLATION_BREACH | 0ms (always fires) |
| BACKUP_STALE | 3600000ms (1hr) |
| BLOCKED_STATUS | 300000ms (5min) |
| CRITICAL_STATUS | 300000ms (5min) |
| Default | 900000ms (15min) |
