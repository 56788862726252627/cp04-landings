# Agency Agent Regression Testing — ADV-10

## Overview

`regressionSuite.js` compares evaluation results against a baseline to detect quality regressions.

## Regression Severity

| Severity | Condition |
|---|---|
| CRITICAL | Score drop > 20 points vs baseline |
| HIGH | Score drop 10-20 points |
| MEDIUM | Score drop 5-10 points |

## Baseline

`agentBaseline.js` — `AGENT_ENGINE_V1_BASELINE` (fixture, isReal: false).
Contains target scores per dimension and per agent type.

## Usage in CI

```js
import { runCICDEvaluationGate } from './bridges/cicdBridge.js';
const gate = runCICDEvaluationGate(report);
if (!gate.pass) throw new Error(gate.blocks.join('; '));
```

## Regression Workflow

1. Run FINAL_EVAL against golden dataset
2. Compare with `detectRegressions(current, baseline)`
3. If any CRITICAL regression → block merge
4. Log HIGH/MEDIUM as warnings in PR

## Prompt Promotion

A prompt version cannot be promoted if it has a critical regression.
See `promptPromotion.js` → `canPromoteAgentPrompt()`.
