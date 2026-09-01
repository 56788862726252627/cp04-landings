# Production Rollback

ADV-04 — When and how to roll back

## Trigger conditions

- HEALTH_CHECK_FAIL — health endpoint not responding correctly
- POST_DEPLOY_QA_FAIL — critical QA check failing
- RUNTIME_BLANK_SCREEN — app renders blank
- AUTH_BROKEN — login flow broken
- DATA_CORRUPTION — data integrity issue detected
- SECURITY_INCIDENT — security event post-deploy
- MANUAL_REQUEST — human decides to roll back

## Rollback adapter

```js
const adapter = createDeployAdapter('DRY_RUN');
const rb = adapter.rollback(deployResult);
// rb.ok === true in DRY_RUN
```

## Rollback readiness

Rollback must be READY before deploy executes.
`canAutoDeploy()` requires `rollbackReady: true`.

## Data migration risk

Always classify migrations as LOW/MEDIUM/HIGH/CRITICAL before deploying.
HIGH or CRITICAL → requires human approval AND backup confirmation before deploy.
