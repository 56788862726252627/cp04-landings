# Agency AI Router — ADV-16

Multi-provider AI Router for the Factory Agency. OpenRouter is one optional provider among several.

## Architecture

```
Agent / Factory Capability
→ AI Router (this layer)
  → Provider Selection (DIRECT | OPENROUTER | LOCAL | CUSTOM)
  → Model Selection (via alias or profile)
  → Cost Guard + Privacy Check + Quality Gate
  → Execute / Fallback / Circuit Breaker
```

## Routing Modes

| Mode | Priority |
|------|----------|
| QUALITY_FIRST | quality > cost > latency |
| BALANCED (default) | equal weighting |
| COST_FIRST | cost > quality > latency |
| LATENCY_FIRST | latency > quality > cost |
| PRIVACY_FIRST | privacy > everything |
| LOCAL_FIRST | prefer local provider |

## Guardrails

- `NO_REAL_OPENROUTER_CALLS=SI`
- `NO_REAL_LLM_SPEND=SI`
- `NO_REAL_API_KEYS=SI`
- `FACTORY_AGENCY_SCOPE_ONLY=SI`
- OpenRouter `execute()` is always BLOCKED in ADV-16

## Source

`fabrica-saas/ai-router/`
