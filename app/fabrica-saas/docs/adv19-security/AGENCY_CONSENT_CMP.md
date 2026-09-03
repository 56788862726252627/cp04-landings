# Agency Consent & CMP Foundation — ADV-19

> **DISCLAIMER:** Technical consent management foundation. Not a certified CMP. Not legal advice.

## Consent Model

`ConsentRecord` tracks: GRANTED / DENIED / WITHDRAWN / EXPIRED / UNKNOWN

Each record requires: subjectRef, purpose, source, policyVersion, evidence.

**Rule:** UNKNOWN consent → data not treated as consented.

## Consent Policy

`ConsentPolicy` detects dark patterns:
- PRESELECTED_MARKETING
- ACCEPT_ONLY_BUTTON
- BUNDLED_CONSENT
- HIDDEN_WITHDRAW

## CMP Foundation

`ConsentManagementPlatformFoundation` manages: categories, vendors, purposes, consent state, policy version, region profile.

No real CMP provider connected in ADV-19.

## Cookie Categories

- `STRICTLY_NECESSARY` → ON by default (allowed)
- `PREFERENCES` → OFF before consent
- `ANALYTICS` → OFF before consent
- `MARKETING` → OFF before consent
- `UNKNOWN` → BLOCKED until classified

**Default Consent Rule:** Non-essential = OFF. UNKNOWN = BLOCKED.

## Cookie Banner

`CookieBannerModel` requires ACCEPT + REJECT + CONFIGURE actions.

Blocked patterns:
- Accept-only
- Preselected marketing/analytics
- REJECT less prominent than ACCEPT

## CMP Quality Gate

BLOCKED by: non-essential-on-by-default, unknown-tracker-active, withdraw-unavailable, forced-accept, marketing-without-consent.

## CMP Readiness Target

```
CMP_READINESS >= 95 (when non-essential tracking exists)
NON_ESSENTIAL_PRECONSENT_BLOCK = 100%
```
