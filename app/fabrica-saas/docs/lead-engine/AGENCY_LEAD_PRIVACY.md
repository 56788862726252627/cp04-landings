# Lead Privacy Policy — ADV-08

## Principles (8 enforced)

| Principle | Description |
|---|---|
| `PUBLIC_BUSINESS_ONLY` | Only collect public business contact data (no personal profiles) |
| `DATA_MINIMIZATION` | Collect only what's needed for outreach qualification |
| `PURPOSE_LIMITATION` | Use lead data only for agency outreach assessment |
| `SOURCE_ATTRIBUTION` | Every lead must carry `source`, `sourceUrl`, `fetchedAt`, `provider` |
| `RETENTION_POLICY` | Leads become STALE after 90 days; FRESH for ≤30 days |
| `NO_PERSONAL_PROFILING` | No personal data inference from business signals |
| `CONSENT_RESPECTED` | Do not scrape behind authentication or bypass consent flows |
| `ACCURACY` | Normalize and validate; never invent missing data |

## Prohibited Fields

These fields are blocked by `auditLeadPrivacy()`:

```
nationalId, taxId, passportNumber, birthDate, gender,
healthData, financialRecords, criminalRecord, religion,
politicalAffiliation, sexualOrientation, biometricData,
personalAddress
```

If any prohibited field is present on a lead, the audit returns `compliant: false`.

## Privacy Audit

```js
import { auditLeadPrivacy } from './privacyPolicy.js';

const result = auditLeadPrivacy(lead);
// result.compliant → true/false
// result.violations → string[]
// result.warnings  → string[]
// result.isReal    → false
```

The audit is a structural check — it is **not a legal certification**. Always consult legal counsel for GDPR/ePrivacy compliance.

## Observability Bridge — PII Sanitization

`observabilityBridge.emitLeadEvent()` automatically strips:
- `publicEmail`
- `publicPhone`

before emitting to the observability layer. Lead scoring data and signals are retained for debugging, but contact fields are never logged.

## Freshness Policy

```js
import { createLeadFreshnessPolicy, evaluateLeadFreshness } from './freshnessPolicy.js';

const policy = createLeadFreshnessPolicy({ freshDays: 30, agingDays: 90 });
const result = evaluateLeadFreshness(lead, policy);
// result.status → 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN'
```

STALE leads should be refreshed or archived rather than used for outreach.

## Data Minimization in Practice

- Do NOT store `birthDate`, `gender`, or personal identifiers in lead records
- Do NOT store scraped data about individual employees (only the business as an entity)
- Do NOT infer personal attributes from business signals
- The `businessFixtures.js` dataset contains no personal data — only business names, public websites, and public contact info

## Rate Policy Prohibitions

The `createLeadDiscoveryRatePolicy()` enforces these as prohibited behaviors:
- `aggressive_scraping`
- `provider_abuse`
- `rapid_repeated_runs`
- `captcha_bypass`
- `rate_limit_evasion`
