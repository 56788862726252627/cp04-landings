# Agency Security Incidents — ADV-19

## Incident Lifecycle

```
DETECTED → TRIAGED → CONTAINED → INVESTIGATING → RESOLVED_SIMULATED → CLOSED_SIMULATED
```

## Severity

LOW / MEDIUM / HIGH / CRITICAL

## Response Plan Steps

1. DETECT — identify the incident
2. CONTAIN — limit spread
3. PRESERVE_EVIDENCE — do not destroy artifacts
4. ASSESS_IMPACT — scope and affected data
5. ESCALATE — required for HIGH/CRITICAL
6. RECOVER — restore safe state
7. REVIEW — post-incident lessons

## Personal Data Breach

`PersonalDataBreachAssessment` — evaluates:
- Personal data involved?
- Sensitivity level
- Scope (internal/external)
- Exposure type
- Affected count

Output:
- UNLIKELY → NO_REVIEW_NEEDED
- POSSIBLE → INTERNAL_REVIEW
- HIGH/CRITICAL → LEGAL_REVIEW_REQUIRED

**Never automatically decides notification obligation.** `legalCertification: false`.
