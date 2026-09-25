# AI Routing Fallback — ADV-16

## Failure Types

RATE_LIMIT | TIMEOUT | PROVIDER_DOWN | MODEL_UNAVAILABLE → retryable → fallback allowed
AUTH | POLICY_BLOCK | CAPABILITY_MISMATCH | COST_BLOCK → NOT retryable → escalate

## Fallback Chain Example

```
direct-premium (primary)
→ direct-fast (secondary, if capable)
→ openrouter (tertiary, if role=FALLBACK and auth configured)
→ local (last resort for capable tasks)
→ SAFE FAILURE (if no capable provider remains)
```

Never falls back to a model incapable of the required capabilities.

## Circuit Breaker

CLOSED → (failures ≥ threshold) → OPEN → (after halfOpenMs) → HALF_OPEN → probe → CLOSED/OPEN
