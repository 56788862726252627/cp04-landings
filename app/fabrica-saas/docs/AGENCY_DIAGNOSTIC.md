# Business Diagnostic Engine

## Output Fields
- `currentSituation` — baseline description inferred from onboarding
- `painPoints` — from mainProblems
- `automationOpportunities` — from manual tasks detected
- `problems[]` — structured problem list
- `quickWins[]` — fast-to-implement improvements
- `mediumTerm[]` — medium-horizon improvements
- `deferredItems[]` — Fase 2 items
- `risks[]` — implementation or business risks
- `diagnosticSummary` — one-line summary

## Guarantees
- No LLM calls — fully deterministic
- No cross-client contamination (all inference from input only)
- Safe to run on fictitious test data
