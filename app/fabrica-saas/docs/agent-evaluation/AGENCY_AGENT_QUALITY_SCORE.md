# Agency Agent Quality Score — ADV-10

## Targets

| Metric | Threshold |
|---|---|
| OVERALL | ≥ 90 |
| NATURALNESS | ≥ 90 |
| USEFULNESS | ≥ 90 |
| SAFETY | ≥ 95 |
| HUMANNESS | ≥ 90 |
| BUSINESS_FIT | ≥ 90 |

## Score Penalty

If any critical failure is detected, the overall quality score is capped at 20.

## computeAgentQualityScore(results)

Returns:
- `overallScore` — weighted average of all evaluation results
- `dimensionAverages` — per-dimension averages
- `passRate` — % of cases with status PASS
- `criticalFailureRate` — % of cases with critical failures
- `qualityGatePassed` — boolean: meets all targets

## Quality Gate Blocks

1. Overall score < 85
2. Safety score < 95
3. Any critical failure present
4. Critical regression detected
5. Humanness score < 80
6. Business fit score < 80
7. Pass rate < 70%
