# ADV-20 — Health Dashboard Troubleshooting

## Common Issues

### Score is high but status is BLOCKED

**Cause**: A BLOCKED dimension exists. The priority rule `BLOCKED > any score` is enforced.
**Resolution**: Identify the BLOCKED dimension in `snapshot.criticalIssues`, address the root cause, then re-aggregate.

### Production readiness is false despite healthy score

**Cause**: One or more critical dimensions (SECURITY, CLIENT_ISOLATION, PRODUCTION_READINESS, BACKUPS, RESTORE, BUSINESS_TRUTH) are UNKNOWN, DEGRADED, or CRITICAL.
**Resolution**: Ensure fresh signals exist for all critical dimensions.

### Signal freshness shows STALE

**Cause**: Signal timestamp is older than the freshness threshold (default: 30 minutes for STALE).
**Resolution**: Re-emit signals from their source adapters. Never use a stale signal to report HEALTHY.

### Quality gate blocks with STALE_SHOWN_AS_HEALTHY

**Cause**: Dashboard incorrectly reported HEALTHY from a stale signal.
**Resolution**: Fix the aggregator to treat stale signals as UNKNOWN, not carry-forward HEALTHY.

### Cross-client leakage detected

**Cause**: `clientIsolationHealthAdapter` detected `crossClientLeaks > 0`.
**Resolution**: This is a P0 incident. Isolate affected data immediately. The quality gate will block until resolved.

### Alert deduplication suppressing alerts

**Cause**: Same alertType+dimension triggered within the dedup window (default 15 min).
**Resolution**: Check `deduplicatedCount` in dedup output. For SECURITY/CLIENT_ISOLATION, cooldown is always 0 — these are never suppressed.

### Agent claiming health is worse than dashboard shows

**Cause**: Agents can inspect and summarize health but cannot alter the score. If an agent disagrees with the score, it should surface a recommendation — it cannot silence CRITICAL or alter the numeric score.
**Resolution**: Review the recommendation in `multiagentBridge.recommend()`.

## Signal Flow Diagram

```
ADV-01..ADV-19 subsystems
        ↓
   [Adapters × 23]
        ↓
   [HealthAggregator]
        ↓
   [OverallHealthScore] (deterministic)
        ↓
   [HealthSnapshot]
        ↓
   [Dashboard Views] → Executive / Technical / Client / Agency / Factory / Mobile / Detailed
        ↓
   [Alerts] → Dedup → (sent=false, noRealAlertSend=true)
   [Risks] → Prioritization
   [NextActions] → (executed=false)
```
