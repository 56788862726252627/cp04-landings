# MCP Security — ADV-12

## Arg Sanitizer
`mcpArgumentSanitizer.js` — redacts keys matching: `password`, `passwd`, `secret`, `private_key`, `api_key`, `token`, `sk_*`, `pk_*`, `Bearer ...`

## Output Redactor
`mcpOutputRedactor.js` — recursively redacts sensitive keys in tool output.

## Client Isolation
`mcpClientIsolationPolicy.js` — `assertClientIsolation(requestClientId, resourceClientId)` throws `CLIENT_ISOLATION_VIOLATION` on cross-client access. Registry keys are namespaced `clientId::resourceId`.

## Secret References
`mcpSecretReference.js` — stores env var names only. `resolve()` always throws in simulation (`NO_REAL_SECRETS=SI`).

## UNKNOWN cost class
`mcpCostGuard.js` — tools with `costClass: UNKNOWN` are always `BLOCKED`, even with human approval.
