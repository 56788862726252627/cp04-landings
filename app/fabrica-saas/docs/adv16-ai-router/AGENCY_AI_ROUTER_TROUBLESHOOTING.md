# AI Router Troubleshooting — ADV-16

## BLOCKED: execute() returns BLOCKED

Expected in ADV-16. Real execution requires auth + production approval.

## ROUTING_GATE_STATUS.BLOCKED

Check blocks array: CAPABILITY_MISMATCH | RESTRICTED_DATA_UNAUTHORIZED | PAID_WITHOUT_APPROVAL | CLIENT_POLICY_VIOLATION | DISABLED_MODEL | UNSAFE_HIGH_RISK_ROUTING

## No eligible model found

- Check `requiredCapabilities` match available models
- Check blocklist not filtering all models
- Check allowedProviders includes at least one available provider

## Circuit breaker OPEN

Provider hit failure threshold. Will probe after `halfOpenAfterMs`. Do not reset manually unless confirmed provider is healthy.

## AUTH_NOT_CONFIGURED

Set `secretConfigured: true` and ensure `secretReference` points to a valid env var. Never hardcode the actual key.

## Cross-client isolation violation

`assertClientBoundary(configClientId, requestClientId)` returns `safe: false`. Check that each client gets its own `AIClientRoutingProfile`.
