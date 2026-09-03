# Agency Restore System — ADV-18

## Overview

Restore validation and planning without executing real restores.

## Restore Modes (ADV-18)

| Mode | ADV-18 Status |
|---|---|
| DRY_RUN | ✅ Available (simulation only) |
| PARTIAL | Foundation only (no real execution) |
| FULL | Foundation only (no real execution) |

## Restore Flow

1. `createRestorePoint(backupId)` — identifies a valid restore candidate
2. `createRestorePlan(restorePoint, mode: DRY_RUN)` — creates the plan
3. `validateRestorePlan(plan, manifest)` — checks compatibility
4. `simulateRestore(plan, manifest)` — dry-run: `wouldRestore / wouldSkip / wouldBlock`
5. `createBackupAuditEntry(RESTORE_DRY_RUN_COMPLETED)` — observability

## RestorePoint States

`AVAILABLE → VERIFIED | DEGRADED | INCOMPATIBLE | BLOCKED`

## Restore Conflicts (6 types)

`VERSION_CONFLICT | SCHEMA_CONFLICT | CLIENT_CONFLICT | EXISTING_DATA_CONFLICT | DEPENDENCY_CONFLICT | POLICY_CONFLICT`

## Human Approval Requirements

Real restore operations ALWAYS require human approval. DRY_RUN does not.
