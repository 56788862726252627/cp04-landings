# One Prompt → Production

ADV-04 — Factory SaaS Pipeline

## What it does

Takes a single business brief and orchestrates the full journey to a production-ready SaaS:

BUSINESS_BRIEF → ANALYSIS → GENERATION → QA → SECURITY → BUILD
→ RELEASE_READINESS → DEPLOY → POST_DEPLOY_QA → HEALTH → HANDOFF → FINAL_URL

## Usage

```js
import { runOnePromptToProduction } from '../production-pipeline/pipelineOrchestrator.js';
import { getNexoVetBrief } from '../production-pipeline/fixtures/nexoVetFixture.js';

const result = runOnePromptToProduction(getNexoVetBrief(), { environment: 'DRY_RUN' });
// result.status === 'SIMULATED'
// result.url.previewUrl — simulated URL
// result.autonomyScore.totalScore — 0-100
```

## Guardrails

- `isReal: false` always in tests and DRY_RUN
- No real credentials ever passed or logged
- No real billing triggered without explicit policy
- No real deploy without human approval + all gates passing
- Staging always run before production (STAGING_FIRST)

## Result shape

See `OnePromptProductionResult` in `onePromptProductionResult.js`.
