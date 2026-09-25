# Agency Backup Client Isolation — ADV-18

## Rule

Client A's backups are completely invisible to Client B.

This is enforced at every layer:

| Layer | Enforcement |
|---|---|
| `BackupCatalog.add()` | Rejects entry if client doesn't match catalog clientId |
| `BackupCatalog.list(clientId)` | Filters by clientId |
| `validateBackupIntegrity()` | `CLIENT_MISMATCH` → `BLOCKED` |
| `simulateRestore()` | `clientId` mismatch → `wouldBlock: ALL` |
| `validateRestorePlan()` | `CLIENT_MISMATCH` → `BLOCKED` |
| `RestoreConflictPolicy` | `CLIENT_CONFLICT` → `BLOCK` (no auto-merge) |
| `MCP Bridge` | Cross-client operations → `HUMAN_APPROVAL_REQUIRED` |
| `Multi-Agent Bridge` | Agents cannot cross client boundaries |

## Multi-Tenant Fixture

`MULTI_TENANT_FIXTURES` covers:
- Client A catalog (isolated)
- Client B catalog (isolated)
- 4 cross-tenant access attempts (all BLOCKED)

## Critical Tests

All 4 cross-client scenarios in `multiTenantFixtures.js` must remain BLOCKED = 100%.
