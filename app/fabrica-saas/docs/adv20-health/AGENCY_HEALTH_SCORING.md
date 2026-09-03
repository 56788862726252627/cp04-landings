# ADV-20 — Health Scoring Reference

## Score Formula

`overallScore = weighted average of all signal scores`

Weights are configured via `createHealthWeightPolicy`. Default (SECURITY_FIRST profile):
- SECURITY: 20
- CLIENT_ISOLATION: 15
- PRODUCTION_READINESS: 15
- All others: 1 (equal weight)

## Grade Scale

| Score | Grade |
|-------|-------|
| ≥ 90 | A+ |
| ≥ 80 | A |
| ≥ 70 | B |
| ≥ 60 | C |
| < 60 | F |
| Any BLOCKED | BLOCKED (grade overridden) |
| Any CRITICAL | CRITICAL |

## Priority Rule (Critical)

**BLOCKED status overrides score.** A system with score=95 but one BLOCKED signal is `overallStatus=BLOCKED`, not HEALTHY. This is enforced in `overallHealthScore.js` and cannot be suppressed.

## Determinism

The core score is fully deterministic. It never depends on LLM output. LLMs may be used for natural-language summaries (executive/client views) but cannot alter the numeric score or override status.

## Score Explainability

`createHealthScoreExplanation(config)` returns:
- `topPositiveFactors` (up to 3): dimensions with score ≥ 80
- `topNegativeFactors` (up to 3): dimensions with score < 60
- `blockers`: all BLOCKED signals
- `grade`: A+/A/B/C/F

## Weight Profiles

| Profile | Focus |
|---------|-------|
| SECURITY_FIRST | Security=20, Isolation=15, Prod=15 |
| BALANCED | All equal |
| PRODUCTION | Prod=20, CI/CD=15, Tests=15 |
| AI_FOCUSED | AI_Router=20, Agents=15, Multiagent=15 |
| BUSINESS_FOCUSED | BusinessTruth=20, CRM=15, Leads=10 |
