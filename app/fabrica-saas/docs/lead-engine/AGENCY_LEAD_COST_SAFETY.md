# Lead Cost Safety — ADV-08

## Cost Guard

Every provider that can incur cost must pass `guardProviderRun()` before execution.

```js
import { createLeadProviderCostGuard, guardProviderRun, COST_STATUS } from './costGuard.js';

const guard = createLeadProviderCostGuard({
  maxBudgetEUR:   10,       // max spend per run
  maxResults:     100,      // max dataset items
  maxActorRuns:   3,        // max actor runs per session
  autoApprove:    false,    // require explicit approval
});

const check = guardProviderRun(provider, guard);
// check.allowed → boolean
// check.costStatus → 'FREE_SAFE' | 'REQUIRES_APPROVAL' | 'BLOCKED'
// check.reason → string
// check.isReal → false
```

## Cost Status Values

| Status | Meaning |
|---|---|
| `FREE_SAFE` | Provider has no cost (Fixture, Manual) |
| `REQUIRES_APPROVAL` | Paid provider within budget — needs explicit OK |
| `BLOCKED` | Budget exceeded or provider not authorized |

## Apify Specific

| Condition | Cost Status |
|---|---|
| No APIFY_TOKEN | FREE_SAFE (FIXTURE_MODE only) |
| Token present, budget > 0, autoApprove false | REQUIRES_APPROVAL |
| Token present, estimatedCost > maxBudgetEUR | BLOCKED |

## Rate Policy

```js
import { createLeadDiscoveryRatePolicy, checkRateAllowed } from './ratePolicy.js';

const policy = createLeadDiscoveryRatePolicy({
  requestsPerMinute: 10,
  burstLimit:        20,
  cooldownMs:        60000,
});

const check = checkRateAllowed(lastRunAt, policy);
// check.allowed → boolean
// check.waitMs  → ms to wait before next run
```

## Prohibited Behaviors (always blocked)

- `aggressive_scraping` — more than burst limit in a short window
- `provider_abuse` — exceeding provider terms of service
- `rapid_repeated_runs` — multiple runs without cooldown
- `captcha_bypass` — bypassing CAPTCHA protections
- `rate_limit_evasion` — using proxies or delays to evade rate limits

## Zero Real Spend Guarantee

In the current implementation (`realRunEnabled: false`):
- Apify provider defaults to FIXTURE_MODE without a token
- costGuard.autoApprove is false by default
- No real actor run can happen without both a valid token AND explicit budget approval

The `LEAD_ENGINE_REGISTRY.guardrails.noRealSpend` flag is always `true` in the registry.

## Usage Estimation

```js
import { getApifyUsageEstimate } from './providers/apifyProvider.js';

const est = getApifyUsageEstimate(config, itemCount);
// Without token: est.estimatedUSD = 0
// With token:    est.estimatedUSD ≈ itemCount / 1000 * 2.5 USD
```

This is an estimate only. Actual Apify cost depends on the actor and dataset size.
