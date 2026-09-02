# Agency Agent Evaluation Privacy — ADV-10

## Privacy by Design

- `NO_REAL_USER_DATA` — all evaluation uses synthetic/fixture data
- `NO_REAL_CONVERSATIONS` — no production conversation data ingested
- `NO_REAL_PII` — no real emails, phones, names, IDs
- Langfuse integration is dry-run only — no data exported

## Redaction Policy

`redactionPolicy.js` strips:
- Email addresses
- Phone numbers
- DNI / IBAN
- Names with formal prefix (Sr., Dra., etc.)

Sensitive object fields automatically redacted:
`contactEmail`, `contactPhone`, `contactName`, `publicEmail`, `publicPhone`

## Sampling Policy

| Mode | When to use |
|---|---|
| ALL_FIXTURES | Default — full golden dataset |
| ERRORS_ONLY | When debugging failures only |
| RISK_BASED | High-risk scenarios above threshold |
| PERCENTAGE | Random sample (configurable %) |
| MANUAL | Specific case IDs |

## Retention Policy

| Tier | Max days | Auto-delete |
|---|---|---|
| EPHEMERAL | 0 (session) | yes |
| SHORT_TERM | 7 | yes |
| STANDARD | 30 | yes |
| LONG_TERM | 90 | yes |
| PERMANENT | — | no (golden fixtures) |

## Privacy Levels

PUBLIC → INTERNAL → SENSITIVE → RESTRICTED

Real PII or real conversations → RESTRICTED (cannot be processed).
