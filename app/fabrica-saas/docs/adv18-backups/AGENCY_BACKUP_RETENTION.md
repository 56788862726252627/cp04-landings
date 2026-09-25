# Agency Backup Retention — ADV-18

## Presets

| Preset | Days | Auto-Delete |
|---|---|---|
| SHORT | 7 | false (requires approval) |
| STANDARD | 30 | false |
| EXTENDED | 90 | false |
| LEGAL_HOLD_FOUNDATION | Infinite | NEVER |
| CUSTOM | configurable | configurable |

## Rules

- `autoDelete` is always `false` if `legalHold: true`
- Backup deletion always requires human approval
- Retention reduction requires human approval (`BACKUP_APPROVAL_TRIGGER.RETENTION_REDUCTION`)

## Expiry States

`ACTIVE → EXPIRING (≤7 days) → EXPIRED`  
Legal hold: `HOLD` (no expiry)

## Retention for PII

PII Level SENSITIVE / RESTRICTED may have shorter retention overrides applied.
