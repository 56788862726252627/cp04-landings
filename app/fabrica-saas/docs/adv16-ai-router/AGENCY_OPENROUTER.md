# Agency OpenRouter Integration — ADV-16

OpenRouter is integrated as an OPTIONAL provider within the AI Router. It does not replace any existing provider.

## Role Options

| Role | Description |
|------|-------------|
| PRIMARY | Preferred provider for requests |
| SECONDARY | Used when primary cannot fulfill |
| FALLBACK | Used only when primary+secondary fail |
| DISABLED | Not used for this client/vertical |

## Auth

- `secretReference: 'OPENROUTER_API_KEY'`
- Real key NEVER stored in code or fixtures
- `AUTH_STATUS.REQUIRES_CONFIGURATION` when not configured

## execute() — BLOCKED in ADV-16

Real execution requires: auth configured + production approval.
In ADV-16: always returns `OPENROUTER_EXECUTE_STATUS.BLOCKED`.

## Source

`fabrica-saas/ai-router/providers/openRouterProvider.js`
`fabrica-saas/ai-router/providers/openRouterAuthProfile.js`
