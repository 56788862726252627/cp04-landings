# Lead Engine Troubleshooting — ADV-08

## Common Issues

### "All leads score below 50"

**Cause:** Missing digital signals and pain signals. The engine can only score what it observes.

**Fix:** Call `inferDigitalSignals(lead)` before scoring. If the lead has a website, it will infer `WEBSITE_PRESENT`. If it has an email, it will infer `RESPONSE_CHANNELS`. Run `detectPainSignals` to auto-infer pain from missing digital signals.

```js
const signals = inferDigitalSignals(lead);
const pain = detectPainSignals({ ...lead, digitalSignals: signals });
const enriched = { ...lead, digitalSignals: signals, painSignals: pain.signals.map(s => s.type) };
const score = calculateOpportunityScore(enriched);
```

### "deduplicateLeads finds 0 duplicates when I expect some"

**How similarity works (max-based):**
- Same domain → 0.95 → DUPLICATE ✓
- Same email → 0.95 → DUPLICATE ✓
- Same externalId → 1.0 → DUPLICATE ✓
- Same phone (9 digits) → 0.90 → DUPLICATE ✓
- Same name + location → 0.75 → POSSIBLE_DUPLICATE only
- Same name only → 0.45 → not detected

**Check:** Are the leads passing `website`, `publicEmail`, `publicPhone`, or `externalId`? If all are empty, only name-based similarity is used which is below threshold.

**For Apify items:** Use `externalId: i.placeId` when constructing items for dedup, not `externalId: i.id` (item IDs are run-unique, placeIds are location-unique).

### "normalizeLead returns FAILED"

Required for `OK`: non-empty `businessName`.  
Returns `PARTIAL` when website, email, or phone are missing.

```js
const r = normalizeLead(lead);
console.log(r.result); // 'OK' | 'PARTIAL' | 'FAILED'
console.log(r.issues); // what's missing
```

### "fetchFromFixtures returns 0 leads for my vertical"

Only these verticals have fixture data: `dental`, `fisio`, `legal`, `veterinary`, `beauty`, `padel`, `education`, `restaurant`.

For other verticals, use `{ maxResults: N }` without a vertical filter to get a mixed set.

### "Apify provider is FIXTURE_MODE"

Expected behavior without APIFY_TOKEN. The provider reads fixtures instead of running real actors. To enable LIVE mode, set `APIFY_TOKEN` env var and pass it to `createApifyProviderConfig({ APIFY_TOKEN: ... })`.

Note: LIVE mode still requires `guardProviderRun()` to return `allowed: true`.

### "cost guard blocks my run"

```js
const check = guardProviderRun(provider, guard);
console.log(check.reason); // explains why it was blocked
```

Common reasons:
- `estimatedCost > maxBudgetEUR` → increase budget or reduce maxResults
- `autoApprove: false` → set `autoApprove: true` for automated pipelines (with caution)
- `requiresToken: true, hasToken: false` → set APIFY_TOKEN env var

### "privacyPolicy audit fails"

```js
const r = auditLeadPrivacy(lead);
console.log(r.violations); // which rules failed
```

Most common: missing `source` field on lead. Set `source: LEAD_SOURCE_TYPE.FIXTURE` (or appropriate type) when creating leads.

### "scoreExplainer lists all fields in missing[]"

The lead has no digital signals, pain signals, website, contact info, or location. Enrich with `inferDigitalSignals` and `detectPainSignals` first.

### "all leads are in RESEARCH_REQUIRED segment"

`dataQualityScore < 35`. Leads need at least a website OR contact info. Run normalization first to ensure fields are populated correctly.

## Test Environment

All tests use `node --test` and `node:assert/strict`. No vitest, no browser. All modules are pure ESM (`.mjs` for tests, `.js` for library modules).

To run ADV-08 tests:
```bash
node --test fabrica-saas/generator/tests/v2-adv08-lead-engine.test.mjs
```

Expected: **188 pass, 0 fail.**
