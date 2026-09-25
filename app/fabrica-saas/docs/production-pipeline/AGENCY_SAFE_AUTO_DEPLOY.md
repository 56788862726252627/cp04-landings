# Safe Auto Deploy Policy

ADV-04 — canAutoDeploy()

## All conditions must pass for AUTO_DEPLOY_ALLOWED

- allCriticalGatesPass — tests, lint, build, security, secrets all PASS
- noMissingSecrets — all required env vars declared (names only, never values)
- noBillingAction — no paid API or billing activation required
- noLegalApproval — no legal sign-off pending
- noDomainBlocker — no domain/DNS action pending
- rollbackReady — rollback plan defined
- observabilityReady — pipeline observability active
- healthChecksReady — health checks available post-deploy
- environmentAllowed — DRY_RUN/STAGING always OK; PRODUCTION needs explicit enable
- humanApprovalSatisfied — no open approval gates

## Outcomes

| Decision | Meaning |
|----------|---------|
| AUTO_DEPLOY_ALLOWED | Proceed automatically |
| WAITING_HUMAN | All gates pass but human must approve first |
| BLOCKED | Critical gate failing — do not deploy |

## Rule

PRODUCTION environment is NEVER auto-deployed until explicitly enabled and all human gates are satisfied.
