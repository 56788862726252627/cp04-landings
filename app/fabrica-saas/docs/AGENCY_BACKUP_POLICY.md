# Backup Policy

**Module**: `maintenance/backupPolicy.js`

**Disclaimer**: NO_REAL_BACKUPS=SI. All backup policies are operational planning models. No data is stored or retrieved.

## Policy by Tier

| Tier | DB Backup | File Backup | Retention | RPO | RTO | Restore Test |
|------|-----------|------------|-----------|-----|-----|-------------|
| BASIC | Weekly | Monthly | 30 days | 7 days | 48h | Monthly |
| PRO | Daily | Weekly | 60 days | 24h | 24h | Monthly |
| PRIORITY | Daily | Daily | 90 days | 4h | 8h | Weekly |

## Backup Health Audit (5 checks)

1. Database backup recent
2. File backup recent
3. Config backup recent
4. Restore test performed
5. Backups verified (checksum/test)

Score: 100 − (deductions per failed check). HEALTHY ≥ 80, WARNING 50-79, CRITICAL < 50.

## API

```js
createBackupPolicy({ clientId, maintenanceTier, ...overrides })
// Returns { valid, errors, policy }

auditBackupHealth(policy, checks)
// checks: { databaseBackupRecent, fileBackupRecent, configBackupRecent, restoreTestRecent, backupVerified }
// Returns { valid, healthScore, status, issues }

evaluateRestoreReadiness(policy, checks)
// Returns { valid, restoreReady, rpo, rto, blockers }
```
