# ADV-17 — Permissions & Human Approval

## Permission Scopes
`TOOL_READ | TOOL_WRITE | DATA_READ | DATA_WRITE | CRM_READ | CRM_WRITE | BOOKING_WRITE | EXTERNAL_WRITE | ADMIN`

## Key Rules
- Agents can **REQUEST** escalation — never self-grant
- `selfGrant` always returns `{ allowed: false }` — cannot be overridden
- Supervisor can delegate permissions within its own scope only

## Human Approval Required For (APPROVAL_TRIGGER)
| Trigger | Example |
|---|---|
| PAYMENT | Charge customer |
| ADS | Launch paid campaign |
| REAL_OUTREACH | Send real emails/WhatsApp |
| PRODUCTION_DEPLOY | Deploy to prod |
| DESTRUCTIVE_WRITE | Delete records |
| SENSITIVE_EXPORT | Export PII |
| PRIVILEGED_CHANGE | Role/permission change |
| LEGAL_MEDICAL_CRITICAL | Legal/medical decision |
| PERMISSION_ESCALATION | Agent requests higher scope |

## Shared Context Sections
| Section | Shared across agents? |
|---|---|
| BUSINESS_FACTS | Yes |
| TASK_STATE | Yes |
| PUBLIC_WORKING | Yes |
| HUMAN_DECISIONS | Yes |
| Private scratch | Never |
| Chain-of-thought | Never |
