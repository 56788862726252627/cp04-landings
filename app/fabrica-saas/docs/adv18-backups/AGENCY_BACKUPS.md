# Agency Backup System — ADV-18

## Overview

The Backup Engine provides a reusable, secure backup foundation for the IA Agency, Factory SaaS, and all generated SaaS products.

## Guardrails

- `NO_REAL_BACKUP=SI` — no real data is ever copied
- `NO_REAL_RESTORE=SI` — no real restore is executed
- `NO_REAL_DELETE=SI` — no backup is ever deleted
- `SECRET_EXCLUSION_ENFORCED=SI` — secrets trigger BLOCKED
- `CLIENT_ISOLATION_ENFORCED=SI` — cross-client access impossible

## Scope Types

| Scope | Description |
|---|---|
| CONFIG | Application configuration files |
| DATA | Structured data exports |
| FILES | Binary/static files metadata |
| METADATA | System metadata snapshots |
| REGISTRY | Factory Registry snapshots |
| BUSINESS_TRUTH | Business Source of Truth state |
| CRM | CRM contact + deal data |
| LEADS | Lead pipeline data |
| AGENT_CONFIG | Multi-agent configuration |
| MEDIA_METADATA | AI media metadata |
| SOCIAL_METADATA | Social content metadata |
| FULL | All scopes combined |

## BackupJob States

`PLANNED → RUNNING → COMPLETED | FAILED | BLOCKED | EXPIRED | DELETED_SIMULATED`

## Secret Exclusion

12 patterns detected automatically — `.env`, `api-key`, `secret`, `password`, `private-key`, `oauth-secret`, `credentials.*`, PEM keys, Stripe/Supabase secrets. Any match → `BLOCKED`.

## Usage

```js
import { createBackupScope, createBackupPolicy, createBackupJob } from '../../backups/index.js';

const scope  = createBackupScope({ scopes: ['CONFIG', 'BUSINESS_TRUTH'], clientId: 'client-a' });
const policy = createBackupPolicy({ scope: scope.scopes, retentionDays: 30 });
const job    = createBackupJob({ clientId: 'client-a', scope: scope.scopes });
// job.isReal === false — simulation only
```
