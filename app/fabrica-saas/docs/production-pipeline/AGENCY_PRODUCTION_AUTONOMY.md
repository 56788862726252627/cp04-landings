# Production Autonomy Score

ADV-04 — calculateProductionAutonomyScore()

## Scoring (0-100)

| Factor | Weight | Description |
|--------|--------|-------------|
| AUTO_STAGES | 20 | % of stages that run automatically |
| MANUAL_ACTIONS | 20 | Penalty for required manual steps |
| EXTERNAL_AUTH | 15 | Penalty for 3rd-party auth needed |
| DEPLOY_AUTO | 15 | Deploy can run without human |
| QA_AUTO | 10 | QA runs automatically |
| SECURITY_AUTO | 10 | Security gates automatic |
| ROLLBACK_AUTO | 5 | Rollback plan automated |
| HANDOFF_AUTO | 5 | Handoff document generated automatically |

## Grade

A ≥80 · B ≥60 · C ≥40 · D ≥20 · F <20

## Typical scores

| Scenario | Score |
|----------|-------|
| DRY_RUN, no integrations | ~75-80 (B-A) |
| With Stripe + WhatsApp | ~50-60 (C-B) |
| With Meta Ads | ~40-50 (C) |
| Full manual (no automation) | ~20 (D) |

## Purpose

Gives the agency a concrete measure of how much of the deployment is already automated,
and how much effort remains for the client to go fully live.
