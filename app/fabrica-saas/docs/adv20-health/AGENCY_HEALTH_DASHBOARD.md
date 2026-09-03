# ADV-20 — Agency Health Dashboard Transversal

## Overview

The ADV-20 Health Dashboard provides a transversal health monitoring engine for the Agencia IA factory and all SaaS products it generates. It spans 27 health dimensions, connects to all ADV-01 through ADV-19 subsystems, and produces deterministic health scores with full explainability.

## Scope

- **FACTORY_AGENCY_SCOPE_ONLY**: This system monitors the factory and agency infrastructure only.
- CP04, Bot Trading, Aurora, FisioNova, EducaArchidona, and production environments are NOT touched.
- All alert sends, deploys, external actions, and costs are simulated (`isReal: false`).

## Key Guardrails

| Guardrail | Value |
|-----------|-------|
| NO_REAL_ALERT_SEND | true |
| NO_REAL_EXTERNAL_ACTION | true |
| NO_REAL_DEPLOY | true |
| NO_REAL_COST | true |
| CP04_TOUCHED | false |
| MAKE_MODE | DRY_RUN |
| AGENT_CAN_SILENCE_CRITICAL | false |
| AGENT_CAN_ALTER_SCORE | false |
| SCORE_IS_DETERMINISTIC | true |
| LEGAL_CERTIFICATION | false |

## Dashboard Views

1. **Executive Summary** — whatsWell / whatsConcerning / whatBlocks / whatToDoNow
2. **Technical View** — full signals with freshness, secrets excluded
3. **Client View** — human-language status, no stack traces, no secrets
4. **Agency View** — portfolio health (fixture only)
5. **Factory View** — factory score 0-100 from 8 boolean flags
6. **Generated SaaS Profile** — health framework inheritance
7. **Mobile Dashboard** — compact: top 3 critical, top 2 warnings, 1 action
8. **Detailed Dashboard** — full detail: signals, risks, history, actions

## Priority Rules

`BLOCKED > CRITICAL > DEGRADED/WARNING > UNKNOWN > HEALTHY`

A high average score NEVER hides a BLOCKED status. UNKNOWN on a critical dimension blocks production readiness.
