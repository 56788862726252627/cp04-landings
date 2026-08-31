# Maintenance Checklist

**Module**: `maintenance/maintenanceChecklist.js`

15 checks across 8 areas. 5 possible outcomes per check.

## Checks

| ID | Area | Name | Critical |
|----|------|------|---------|
| CHK-01 | SECURITY | SSL/TLS certificates valid | ✓ |
| CHK-02 | SECURITY | No secrets in codebase | ✓ |
| CHK-03 | SECURITY | Dependency vulnerabilities | ✓ |
| CHK-04 | SECURITY | Access permissions review | |
| CHK-05 | BACKUP | Database backup recent | ✓ |
| CHK-06 | BACKUP | Restore test performed | |
| CHK-07 | PERFORMANCE | Core Web Vitals within threshold | |
| CHK-08 | PERFORMANCE | API response times | |
| CHK-09 | INTEGRATIONS | Third-party integrations healthy | ✓ |
| CHK-10 | AUTOMATIONS | Automation workflows active | |
| CHK-11 | AI | AI agent health | |
| CHK-12 | DEPENDENCIES | Node/framework versions | |
| CHK-13 | MONITORING | Error rate within threshold | |
| CHK-14 | MONITORING | Uptime SLO met | |
| CHK-15 | SECURITY | Data retention policy enforced | |

## Check Outcomes

PASS | FAIL | WARNING | NOT_APPLICABLE | PENDING

## Scoring

`score = round((passed / 15) × 100)`

- HEALTHY: ≥ 80
- WARNING: 60-79
- CRITICAL: < 60 OR any critical check FAILED

## API

```js
buildChecklistResult(results, maintenanceTier?)
// results: { 'CHK-01': 'PASS', ... }
// Returns { total, passed, failed, warnings, pending, criticalFailed, score, overallStatus, checks }
```
