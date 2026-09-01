# Production Pipeline — Troubleshooting

ADV-04

## Pipeline stuck at WAITING_HUMAN

Check `result.manualActions` — each entry shows exactly what's needed.
Complete the action externally, then call `resumeProductionPipeline()`.

## BLOCKED: CRITICAL_GATES_FAILING

One or more P0 gates failed (tests / lint / build / security / secrets).
Fix the underlying issue — do NOT bypass the gate.

## BLOCKED: MISSING_SECRETS

Required env var names listed in `deployPlan.secretsRequired`.
Add to Cloudflare Pages / environment config (names only — never in code).

## BLOCKED: ENVIRONMENT_NOT_ALLOWED

PRODUCTION environment requires explicit enable + all human approvals.
For testing: use DRY_RUN or STAGING.

## Automation plan shows MANUAL_AUTH_REQUIRED

Integration (Stripe, WhatsApp, Meta) needs OAuth or API key before scenarios can be created in Make.
This is expected — list in handoff as pending.

## Health status DEGRADED

Do not complete handoff. Investigate health endpoint.
Check observability events via `logger.getEvents()`.

## ROLLBACK not available

Always ensure rollback plan exists before deploy.
In DRY_RUN: `adapter.rollback(deployResult)` always succeeds.
In PRODUCTION: previous release must be pinned before new deploy starts.
