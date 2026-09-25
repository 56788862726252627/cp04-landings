# Agency AI Privacy & Security — ADV-19

> Connects ADV-16 (AI Router), ADV-17 (Multi-Agent), ADV-12 (MCP)

## AI Privacy Policy

`AIPrivacyPolicy` controls:
- Prompt PII minimization
- Secret exclusion from prompts
- Provider routing awareness
- Training opt-out (unknown by default)
- Context window minimization
- Retention assumptions

**Rule:** Email or secrets in prompts → BLOCKED.

## AI Provider Data Handling

`AIProviderDataHandlingProfile` tracks per-provider:
- `retentionKnown` — is data retention policy documented?
- `trainingKnown` — is training opt-out available?
- `regionKnown` — is data region documented?

**Rule:** `UNKNOWN ≠ SAFE`. Unknown providers → REVIEW_REQUIRED before using with sensitive data.

## Agent Security

`AgentSecurityPolicy` enforces (connects ADV-17):
- NO_SELF_PERMISSION — agents cannot grant themselves permissions
- NO_CROSS_CLIENT_MEMORY — memory isolated per client
- NO_EXTERNAL_ACTION_WITHOUT_APPROVAL — human gate required
- NO_BUSINESS_TRUTH_BYPASS — business source of truth cannot be bypassed
- NO_SECRET_PROPAGATION — secrets never passed between agents
- PROMPT_INJECTION_GUARD — active for all agent tasks

## Prompt Injection Detection

`PromptInjectionSecurityPolicy` — 8 patterns:
1. ignore previous instructions
2. disable guardrails
3. reveal secret
4. change tenant
5. act as admin
6. authorize payment
7. send external message
8. bypass approval

## Tool Security (ADV-12 MCP)

`ToolSecurityPolicy`:
- WRITE operations → human approval required
- EXTERNAL operations → human approval required
- RESTRICTED data + non-read-only → always BLOCKED
- Cross-client tool access → always BLOCKED
