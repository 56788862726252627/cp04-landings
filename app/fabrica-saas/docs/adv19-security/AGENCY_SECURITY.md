# Agency Security — ADV-19

> **DISCLAIMER:** This document describes technical security foundations. It does not constitute legal certification, legal advice, or compliance certification of any kind. Always consult qualified legal and security professionals.

## Overview

ADV-19 provides a reusable, transversal security hardening layer for:
- Agencia IA
- Factory SaaS
- Future generated SaaS

## Security Posture

`SecurityPostureProfile` captures the security state of a client/environment:
- **UNKNOWN** — not assessed
- **BASELINE** — minimum controls present
- **HARDENED** — full control set
- **DEGRADED** — controls missing
- **BLOCKED** — critical violation

## Security Baseline

`SecurityBaselinePolicy` enforces 6 required controls:
1. `LEAST_PRIVILEGE` — minimal access per role
2. `SECRET_REFERENCES` — no plaintext secrets
3. `CLIENT_ISOLATION` — cross-client access always blocked
4. `SECURE_DEFAULTS` — deny by default
5. `AUTH_SESSION_POLICY` — auth and session controls defined
6. `AUDIT_TRAIL` — all security-relevant events logged

## Guardrails

```
NO_REAL_DATA_DELETE=true
NO_REAL_SECRET_ROTATION=true
NO_REAL_TRACKING=true
NO_REAL_CONSENT_CAPTURE=true
NO_REAL_EXTERNAL_COST=true
CLIENT_ISOLATION_ENFORCED=true
SECRET_EXCLUSION_ENFORCED=true
LEGAL_CERTIFICATION=false
```
