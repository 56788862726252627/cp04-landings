# AI Routing Privacy Policy — ADV-16

## Privacy Levels

PUBLIC_SAFE → BUSINESS_INTERNAL → PERSONAL → SENSITIVE → RESTRICTED

## Rules

- RESTRICTED data: provider must have explicit policy (`requiresExplicitPolicy: true`)
- Local provider: can handle RESTRICTED (privacy-preserving)
- OpenRouter/public: max BUSINESS_INTERNAL by default
- Data minimization runs before any provider: `redactSecrets()` + `redactPII()`

## Data Minimization

Context trimmed to `maxContextChars`, secrets/PII redacted before any external provider.
