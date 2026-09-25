# Manual Actions

ADV-04 — What humans must do

## Action types

| Type | When triggered | Typical wait |
|------|---------------|-------------|
| OAUTH | 3rd party login required | 15-30 min |
| API_KEY | External key setup | 15 min + propagation |
| BILLING | Stripe/paid plan activation | 20 min |
| DOMAIN | Custom domain setup | 10 min + DNS (up to 24h) |
| DNS | DNS record changes | 10 min + propagation |
| LEGAL_APPROVAL | Legal/medical vertical | 2-3 days |
| WHATSAPP_TEMPLATE | Meta Business approval | 2+ days |
| APPROVAL | General human sign-off | 15 min |
| EXTERNAL_PERMISSION | 3rd party access grant | 30 min + external |

## Pipeline behaviour

When a manual action is required:

1. Pipeline transitions to `WAITING_HUMAN`
2. `manualActions` array lists exactly what's needed
3. Human completes action externally
4. Call `resumeProductionPipeline()` with completed action IDs
5. Pipeline resumes from exact stop point — no re-generation

## Principle

Never vague. Each action has: `type`, `provider`, `reason`, `instructions`.
No secrets are stored or shown — only action descriptions.
