# Agency Disaster Recovery — ADV-18

## Overview

Disaster Recovery (DR) profiles and qualitative recovery objectives for the agency and generated SaaS clients.

## Criticality Levels

| Level | Use Case |
|---|---|
| LOW | Non-critical internal tooling |
| STANDARD | Business systems |
| HIGH | Revenue-critical systems |
| CRITICAL | Production customer data |

## Recovery Objectives (Qualitative)

| Class | RPO / RTO |
|---|---|
| BEST_EFFORT | No commitment |
| DAILY | Data loss up to 1 day |
| HOURLY_FOUNDATION | Foundation for hourly — infrastructure not verified |
| NEAR_REALTIME_FOUNDATION | Foundation — infrastructure not verified |

> These are qualitative targets only. No infrastructure backing these claims in ADV-18.

## Recovery Drill

Drills verify that backups are actually restorable, not just created.

States: `PLANNED → PASSED | WARNING | FAILED`

Recommended: Run a recovery drill monthly per client.

## Recovery Readiness Score

8 factors: backup freshness (25%), integrity (20%), restore validation (20%), retention (10%), encryption (10%), rollback (5%), client isolation (5%), documentation (5%).

Target: ≥ 90 (grade A).
