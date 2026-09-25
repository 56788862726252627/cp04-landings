# Agency Backup Security — ADV-18

## Secret Exclusion (12 patterns)

Any of these in a backup path or content → `status: BLOCKED`:

- `.env` files
- `api-key`, `secret-key`, `access-token`
- `bearer <token>`
- `password`
- `private-key`, `oauth-secret`
- `credentials.json / .yaml / .toml`
- PEM private keys (`-----BEGIN * PRIVATE KEY-----`)
- `stripe-secret`, `stripe-sk_`
- `supabase-service-role`

## Encryption Policy

| Status | Meaning |
|---|---|
| REQUIRED | Must encrypt before storing |
| RECOMMENDED | Should encrypt |
| OPTIONAL | May encrypt |
| NOT_APPLICABLE | No encryption needed |

Sensitive PII (SENSITIVE/RESTRICTED) → `encryptionRequired: true`.

## Key Reference Policy

Only `secretReference` (name pointer) is allowed in backups. Raw key material (`keyMaterial`) is ALWAYS blocked.

## Client Isolation

Cross-client backup access is always blocked:
- `BackupCatalog.add()` validates client
- `validateBackupIntegrity()` validates client scope
- `simulateRestore()` validates client match
