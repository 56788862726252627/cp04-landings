# Agency GDPR Technical Readiness — ADV-19

> **IMPORTANT DISCLAIMER:**
> This describes **TECHNICAL READINESS** only.
> It does NOT constitute GDPR compliance certification.
> It does NOT replace legal advice or formal Data Protection Impact Assessment (DPIA).
> Always consult qualified legal counsel and a Data Protection Officer (DPO) for GDPR obligations.

## Technical Readiness Score

`GDPRTechnicalReadinessScore` — 10 weighted factors:
- Data mapping (0.15)
- Rights foundation (0.15)
- Retention (0.10)
- Consent (0.12)
- Audit (0.10)
- Security (0.12)
- Privacy (0.08)
- Processors (0.08)
- Breach foundation (0.05)
- Deletion foundation (0.05)

## Data Subject Rights Foundation

6 rights supported: ACCESS, RECTIFICATION, ERASURE, RESTRICTION, PORTABILITY, OBJECTION.

- ERASURE blocked if `legalHold=true`
- PORTABILITY requires CONSENT or CONTRACT legal basis
- All rights: 30-day deadline class

## DSAR Process

1. Received → Identity verification required
2. Identity verified → In Review
3. Review → Ready
4. Ready → Completed (simulated only in ADV-19)

**Rule:** Never deliver data based solely on knowing an email address.

## Legal Basis

7 foundations: CONSENT, CONTRACT, LEGAL_OBLIGATION, VITAL_INTEREST, PUBLIC_TASK, LEGITIMATE_INTEREST, UNKNOWN.

`UNKNOWN` → always requires legal review. `LEGITIMATE_INTEREST` → requires balancing test.

## GDPR Technical Gate

States: PASS / WARNING / REVIEW_REQUIRED / BLOCKED

No automatic legal obligation determination.
