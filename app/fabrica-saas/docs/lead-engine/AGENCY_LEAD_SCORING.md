# Lead Scoring System — ADV-08

## Opportunity Score (0–100)

The opportunity score is a weighted composite of four sub-scores:

| Component | Weight | What it measures |
|---|---|---|
| **FIT** | 40% | How well the agency can serve this business |
| **URGENCY** | 30% | How much the business needs help now |
| **VALUE** | 20% | Potential ticket size and revenue |
| **EASE** | 10% | How easy this lead is to convert |

```js
opportunityScore = fit*0.40 + urgency*0.30 + value*0.20 + ease*0.10
```

Custom weights can be passed to `calculateOpportunityScore(lead, customWeights)`.

## Fit Score (6 factors)

| Factor | Default weight |
|---|---|
| verticalCompatibility | 25 |
| problemServiceMatch | 25 |
| technicalFeasibility | 20 |
| digitalGap | 15 |
| businessSizeFit | 10 |
| agencyCapability | 5 |

Higher gap in digital maturity → higher fit (more transformation potential).

## Urgency Score

Base: sum of pain signal confidence values.  
Bonus: +10 for ABSENT digital maturity, +5 for MINIMAL.  
Clamped to 0–100.

## Value Score

| Factor | Contribution |
|---|---|
| Business size (LARGE/MEDIUM/SMALL/MICRO) | 30–60 pts |
| Service breadth (number of recommended services) | up to 20 pts |
| Multi-location | +10 |
| AI signals present | +5 |

## Ease Score

| Factor | Contribution |
|---|---|
| Has public email | +20 |
| Has public phone | +15 |
| Clear primary service | +20 |
| Existing website | +10 |
| Digital maturity ≥ BASIC | +10 |
| Social presence | +5 |

## Temperature Classification

| Temperature | Threshold |
|---|---|
| HOT | opportunityScore ≥ 80 |
| WARM | opportunityScore ≥ 60 |
| COLD | opportunityScore ≥ 40 |
| NURTURE | opportunityScore < 40 |

Thresholds are configurable via second parameter of `classifyTemperature()`.

## Data Quality Score (7 factors)

| Factor | Weight |
|---|---|
| BUSINESS_IDENTITY (name + vertical) | 25 |
| WEBSITE | 20 |
| CONTACT_AVAILABLE (email or phone) | 15 |
| LOCATION | 15 |
| FRESHNESS | 10 |
| SOURCE_RELIABILITY | 10 |
| SIGNAL_COMPLETENESS (pain + digital) | 5 |

Data quality is independent of commercial quality — a lead can have perfect contact data but a low opportunity score.

## Score Explainer

`explainLeadScore(lead)` returns:
- `reasons[]` — why the score is high
- `missing[]` — key data that's absent
- `improvers[]` — actions that would increase the score
- `serviceFit` — primary service recommendation
- `summary` — one-sentence human-readable summary

## Commercial Probability (Ordinal)

Not a percentage. Based on a composite of opportunityScore, dataQualityScore, confidence:

| Probability | Composite ≥ |
|---|---|
| VERY_HIGH | 80 |
| HIGH | 60 |
| MEDIUM | 40 |
| LOW | < 40 |

**Note:** "Ordinal estimate only — no historical conversion data available."

## Economic Potential (Illustrative)

| Level | Ticket range (EUR) |
|---|---|
| VERY_HIGH | 5,000–20,000 |
| HIGH | 2,000–7,000 |
| MEDIUM | 800–2,500 |
| LOW | 200–1,000 |

**Note:** "Illustrative estimate only — not a price commitment."
