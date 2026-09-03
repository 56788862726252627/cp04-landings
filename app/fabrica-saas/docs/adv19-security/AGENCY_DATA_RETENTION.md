# Agency Data Retention — ADV-19

## Retention Presets

| Preset | Days | Use Case |
|--------|------|----------|
| SESSION | 1 | Temporary session data |
| SHORT | 7 | Transient operational data |
| STANDARD | 30 | Default business data |
| EXTENDED | 365 | Long-term business records |
| LEGAL_HOLD_FOUNDATION | ∞ | Legal proceedings |
| CUSTOM | defined | Special requirements |

## Retention States

- `ACTIVE` — within retention window
- `EXPIRING` — ≤7 days remaining
- `EXPIRED` — past retention window
- `HOLD` — legal hold active

## Data Deletion Plan

`DataDeletionPlan` — DRY_RUN only in ADV-19.

Types: DELETE / ANONYMIZE / PSEUDONYMIZE / RETAIN_LEGAL_HOLD / BLOCKED

Blockers:
- `LEGAL_HOLD_ACTIVE` → type becomes RETAIN_LEGAL_HOLD
- `IDENTITY_NOT_VERIFIED` → DSAR erasure blocked

No real data deleted in ADV-19.
