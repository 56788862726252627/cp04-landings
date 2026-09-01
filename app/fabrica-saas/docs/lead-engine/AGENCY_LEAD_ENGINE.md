# Agency Lead Engine — ADV-08

## Overview

The Lead Engine is a pure-JS, test-first module that discovers, normalizes, enriches, scores and prioritizes business leads for Agency IA. It has **zero real-world side effects** in its current state: no Apify actor runs, no outreach, no spend.

**isReal: false on all output** — all lead records and reports carry this flag to prevent confusing fixture data with production data.

## Architecture

```
[Discovery]    discoveryPlan  →  providers (Fixture / ManualImport / Apify)
[Pipeline]     normalizationEngine → deduplicationEngine → dataQualityEngine
[Signals]      digitalMaturityAnalyzer → painSignalDetector → serviceMatcher
[Scoring]      fitScore + urgencyScore + valueScore + easeScore → opportunityScore
[Classify]     temperatureClassifier → commercialProbability → economicPotential
[Prioritize]   leadPrioritizer → scoreExplainer → nextBestAction
[Segment]      segmentation → fastWinDetector → highValueDetector
[Report]       leadEngineReport
[Policy]       privacyPolicy + freshnessPolicy + costGuard + ratePolicy
[Bridges]      agentEngineBridge · crmBridge · makeBridge · observabilityBridge · outreachDraftContext · personalizationContext
```

## Core Modules (30 total)

| Module | Role |
|---|---|
| `leadModel` | Lead / LeadSource data shapes, frozen constants |
| `leadSearchProfile` | Search criteria and source preferences |
| `discoveryPlan` | Builds a safe execution plan from a profile + provider list |
| `normalizationEngine` | Cleans phone, email, domain, URL, name, location |
| `deduplicationEngine` | Similarity-based dedup (max-signal approach) |
| `dataQualityEngine` | 7-factor weighted quality score 0-100 |
| `digitalMaturityAnalyzer` | 13 digital signals → ADVANCED/ESTABLISHED/BASIC/MINIMAL/ABSENT |
| `painSignalDetector` | 15 pain types with auto-inference from digital signals |
| `serviceMatcher` | Maps vertical + pain → agency services |
| `fitScore` | Vertical / problem / size / digital gap fit |
| `urgencyScore` | Pain severity + digital maturity gap |
| `valueScore` | Business size + multi-location + service breadth |
| `easeScore` | Contact availability + infrastructure + service clarity |
| `opportunityScore` | Composite: FIT×40 + URGENCY×30 + VALUE×20 + EASE×10 |
| `temperatureClassifier` | HOT≥80 / WARM≥60 / COLD≥40 / NURTURE<40 |
| `commercialProbability` | Ordinal estimate (VERY_HIGH / HIGH / MEDIUM / LOW) |
| `economicPotential` | Illustrative ticket range by size + fit |
| `leadPrioritizer` | Sort + filter with hot/warm/cold/nurture grouping |
| `scoreExplainer` | Human-readable reasons, missing data, improvers |
| `nextBestAction` | RESEARCH_MORE / QUALIFY / PREPARE_OUTREACH / NURTURE / DEFER / IGNORE |
| `segmentation` | 6 segments: HIGH_PRIORITY / FAST_WIN / HIGH_VALUE_LONGER_CYCLE / NURTURE / RESEARCH_REQUIRED / LOW_PRIORITY |
| `fastWinDetector` | Finds leads with high ease + score + contact + service |
| `highValueDetector` | Finds leads with high value + fit |
| `leadEngineReport` | Full pipeline statistics and quality score |
| `privacyPolicy` | 8 principles + prohibited fields audit |
| `freshnessPolicy` | FRESH/AGING/STALE/UNKNOWN by discoveredAt date |
| `costGuard` | Provider budget enforcement before any live call |
| `ratePolicy` | Rate limits + prohibition list for scraping |
| `agencyBridge` | Maps lead to agency vertical + capability check |

## Providers (4 total)

- **FixtureProvider** — 30 fictional businesses, always FREE_SAFE
- **ManualImportProvider** — CSV row import with validation
- **ApifyProvider** — FIXTURE_MODE without token; REQUIRES_APPROVAL with token
- **LeadDiscoveryProvider** — Base descriptor shape for future providers

## Bridges (6 total)

| Bridge | Target |
|---|---|
| `agentEngineBridge` | ADV-03 Agent Engine (context + sales prep) |
| `personalizationContext` | Personalization hooks from public signals |
| `outreachDraftContext` | Draft context — readyToSend always false |
| `crmBridge` | ADV-09 CRM (future) |
| `makeBridge` | Make automation manifests |
| `observabilityBridge` | ADV-01 Observability (sanitizes PII before emit) |

## Guardrails

- `NO_REAL_OUTREACH` — outreachDraftContext.readyToSend is always `false`
- `NO_REAL_SPEND` — costGuard blocks unapproved provider runs
- `NO_REAL_SCRAPING` — Apify runs require explicit APIFY_TOKEN + budget approval
- `DATA_MINIMIZATION` — PROHIBITED_FIELDS enforced by privacyPolicy audit
- `isReal: false` — all output tagged; never mix with production records

## Fixtures

- 30 fictional businesses (dental 5, fisio 5, legal 4, veterinary 4, beauty 4, padel 3, education 3, restaurant 2)
- 6 simulated Apify items (item 006 = intentional duplicate of item 001 for dedup testing)
