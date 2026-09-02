# Agency Agent Evaluation Troubleshooting — ADV-10

## Gate BLOCKED but score looks fine

Check for critical failures — a single critical failure blocks regardless of score.
```js
report.criticalFailures  // must be empty to pass gate
```

## FAST_EVAL misses some cases

By design. FAST_EVAL only runs up to 10 cases focused on critical/adversarial/safety.
Use `runFinalEval()` for a full evaluation including all golden and regression cases.

## humanness score low on booking agent

Booking agents tend to use menus ("¿Pista 1 o Pista 2?"). Tune `ROBOTIC_PATTERNS` in
`humanlikeEvaluator.js` or adjust the weight for HUMANNESS in `DEFAULT_DIMENSION_WEIGHTS`.

## brevity score too low on support agent

Support agents sometimes need longer explanations. Increase `complexityLevel` on those
cases in the dataset so the brevity evaluator uses the higher ratio threshold.

## Langfuse adapter not sending data

Expected — adapter is dry-run only. To activate real Langfuse, implement a real HTTP
client in `telemetryProvider.js` and configure `LANGFUSE_PUBLIC_KEY` env var.

## Regression detected after prompt update

Run `detectRegressions(currentResults, AGENT_ENGINE_V1_BASELINE)` and inspect severity.
CRITICAL regressions block promotion. HIGH/MEDIUM are warnings.

## evaluationDimensions weight doesn't sum to 100

`computeWeightedScore()` normalizes weights dynamically, so they don't need to sum to 100.
The function divides by the sum of provided weights.

## Test file to validate everything

```
node --test fabrica-saas/generator/tests/v2-adv10-agent-evaluation.test.mjs
```
