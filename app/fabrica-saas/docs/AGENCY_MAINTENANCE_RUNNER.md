# Maintenance Runner & Report

**Modules**: `maintenance/maintenanceRunner.js`, `maintenance/maintenanceReport.js`

## Maintenance Cycle

`runMaintenanceCycle(config)` orchestrates a full maintenance cycle:

1. **Checklist** — buildChecklistResult (15 checks)
2. **Backup Audit** — auditBackupHealth + evaluateRestoreReadiness
3. **Automation Audit** — auditAutomationHealth (Make/Zapier scenarios)
4. **AI Health** — auditAIHealth (agent fleet)
5. **Security Maintenance** — runSecurityMaintenance (10 security checks)
6. **Client Health Score** — calculateClientHealthScore (composite 0-100)
7. **Report** — generateMaintenanceReport (structured output)

## Cycle Status

| Status | Condition |
|--------|-----------|
| HEALTHY | No critical issues, < 2 warnings |
| WARNING | ≥ 3 sub-audits in WARNING |
| CRITICAL | Any sub-audit in CRITICAL |
| INCOMPLETE | > 5 pending checklist items |

## Config

```js
runMaintenanceCycle({
  clientId,           // required
  maintenanceTier,    // 'BASIC' | 'PRO' | 'PRIORITY'
  policy,             // BackupPolicy object (optional)
  checklistResults,   // { 'CHK-01': 'PASS', ... }
  automationInput,    // { scenarios: [...] }
  aiInput,            // { agents: [...] }
  securityInput,      // { checks: { 'SEC-01': 'PASS', ... } }
  backupChecks,       // { databaseBackupRecent, ... }
})
// Returns { valid, cycle, report }
```

## Report Sections

executiveSummary | checklistResults | backupStatus | securityReview | automationHealth | aiHealth | actionsRequired | nextCycle

**Disclaimer**: No real system changes, backups, or deployments performed.
