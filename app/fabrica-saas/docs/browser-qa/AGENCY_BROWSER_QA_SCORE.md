# Browser QA Score System — ADV-06

## Score Formula

```
Score = Σ (phaseScore × phaseWeight) / Σ weights
```

Phase scores: `PASS=100`, `WARN=60`, `FAIL=0`

## Phase Weights

| Phase | Weight | Blocking if FAIL? |
|-------|--------|-------------------|
| RENDER | 20% | Yes |
| CONSOLE | 15% | Yes |
| NETWORK | 10% | Yes |
| CONTROLS | 10% | Yes |
| FORMS | 8% | No |
| RESPONSIVE | 8% | No |
| ACCESSIBILITY | 8% | No |
| KEYBOARD | 5% | No |
| VISUAL | 5% | No |
| CRITICAL_FLOWS | 6% | No |
| PERFORMANCE | 5% | No |

## Grade Table

| Score | Grade | Meaning |
|-------|-------|---------|
| 95–100 | A+ | Excellent — production ready |
| 90–94 | A | Strong — production with sign-off |
| 80–89 | B | Good — beta channel |
| 70–79 | C | Acceptable — beta with review |
| 60–69 | D | Needs work — staging only |
| 0–59 | F | Blocked — fix before any deploy |

## Release Policy

| Channel | Min Score |
|---------|-----------|
| INTERNAL | 0 |
| STAGING | 50 |
| BETA | 70 |
| PRODUCTION | 85 |

**Production always requires human sign-off**, even if score ≥ 85.

## Example Score Calculation

```
RENDER=PASS(100×0.20) + CONSOLE=PASS(100×0.15) + NETWORK=WARN(60×0.10)
+ CONTROLS=PASS(100×0.10) + FORMS=PASS(100×0.08) + RESPONSIVE=PASS(100×0.08)
+ ACCESSIBILITY=WARN(60×0.08) + KEYBOARD=PASS(100×0.05) + VISUAL=PASS(100×0.05)
+ CRITICAL_FLOWS=PASS(100×0.06) + PERFORMANCE=PASS(100×0.05)

= (20+15+6+10+8+8+4.8+5+5+6+5) / 1.0 ≈ 92.8 → Grade A
```
