# Apify Provider Integration — ADV-08

## Status: FIXTURE_MODE (no real runs)

The Apify provider runs in `FIXTURE_MODE` by default. A real Apify actor run requires:
1. `APIFY_TOKEN` env var set (length > 5)
2. Budget approval via `costGuard`
3. Explicit `autoApprove: true` or manual confirmation

## Provider Modes

| Mode | Condition |
|---|---|
| `FIXTURE_MODE` | No APIFY_TOKEN → reads fixture data only |
| `LIVE` | Token present + budget approved |
| `DRY_RUN` | Token present, budget = 0 |
| `BLOCKED` | costGuard blocked the run |

## Configuration

```js
import { createApifyProviderConfig } from './providers/apifyProvider.js';

const config = createApifyProviderConfig({
  APIFY_TOKEN: process.env.APIFY_TOKEN,  // optional
  maxDatasetItems: 100,                   // default: 50
  maxRunBudget: 10,                       // EUR, default: 5
});
// config.mode → 'FIXTURE_MODE' (without token)
// config.isReal → false
```

## Cost Guard Integration

```js
import { createLeadProviderCostGuard, guardProviderRun } from './costGuard.js';

const guard = createLeadProviderCostGuard({ maxBudgetEUR: 10, autoApprove: false });
const check = guardProviderRun(config, guard);

if (!check.allowed) {
  console.log('Blocked:', check.reason);
  // Use fixture provider instead
}
```

## Apify Fixture

`APIFY_FIXTURE_RESPONSE` in `fixtures/apifyFixture.js` simulates a Google Maps actor response with 6 items. Item 006 is an intentional duplicate of item 001 (same `placeId`, same domain, same email) for dedup testing.

## Input Building

```js
import { buildApifyInput } from './providers/apifyProvider.js';

const input = buildApifyInput({
  vertical: 'dental',
  locations: ['Málaga', 'Marbella'],
  maxResults: 50,
});
// input.isReal → false
// input.query → 'clínica dental cerca de Málaga'
```

## Result Normalization

```js
import { normalizeApifyResult } from './providers/apifyProvider.js';

const lead = normalizeApifyResult(rawApifyItem);
// Returns: { businessName, website, publicEmail, publicPhone, location, vertical, externalId, ... isReal: false }
```

## Risk Estimation

```js
import { estimateApifyRunRisk } from './providers/apifyProvider.js';

const risk = estimateApifyRunRisk(config, { maxResults: 100 });
// Without token: risk.risk = 'NONE', costStatus = 'FREE_SAFE'
// With token:    risk.risk = 'LOW/MEDIUM/HIGH', costStatus = 'REQUIRES_APPROVAL'
```

## Prohibited Operations

- Never bypass `guardProviderRun()` before a live actor call
- Never store APIFY_TOKEN in code, tests, or fixture files
- Never run actors without explicit budget approval
- Never scrape behind authentication without authorization
- Never bypass CAPTCHA or evade rate limits
