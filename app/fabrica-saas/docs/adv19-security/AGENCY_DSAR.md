# Agency DSAR — Data Subject Access Requests — ADV-19

> **DISCLAIMER:** Technical DSAR foundation only. Not a substitute for legal DSAR process. Consult DPO and legal counsel.

## DSAR Lifecycle

```
RECEIVED → IDENTITY_REQUIRED → IN_REVIEW → READY → COMPLETED_SIMULATED
                                          ↓
                                        BLOCKED
```

## Identity Verification

`DSARIdentityVerificationPolicy` — rule: **email alone is never sufficient**.

Verification methods (in order of preference):
1. AUTHENTICATED_SESSION
2. EMAIL_CONFIRMATION (only for low-risk requests)
3. MANUAL_REVIEW
4. RISK_ESCALATION (for high-risk or unknown)

## DSAR Data Map

10 data sources mapped: CRM, LEADS, AGENT_CONVERSATIONS, BUSINESS_DATA, MEDIA_METADATA, SOCIAL_METADATA, AUDIT_ENTRIES, BACKUPS, AUTH, CONSENT.

Audit entries: retention may apply (not always deletable).
Backups: separate deletion process required.

## Response Plan

8 steps: VERIFICATION → SCOPE → SEARCH → EXCEPTIONS → HUMAN_REVIEW → ACTION → AUDIT → COMPLETION

Always simulation in ADV-19.

## Deadline

Standard: 30 days (STANDARD_30_DAYS)
