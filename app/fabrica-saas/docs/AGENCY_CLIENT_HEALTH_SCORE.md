# Client Health Score

**Module**: `maintenance/clientHealthScore.js`

## Composite Score (0-100)

Weighted average of 5 audit dimensions:

| Dimension | Weight |
|-----------|--------|
| checklistScore | 30% |
| securityScore | 25% |
| backupScore | 20% |
| automationScore | 15% |
| aiScore | 10% |

## Health Labels

| Score | Label |
|-------|-------|
| 80-100 | HEALTHY |
| 60-79 | WATCH |
| 40-59 | AT_RISK |
| 0-39 | CRITICAL |

## Recommendations (auto-generated)

- securityScore < 70 → Run security review
- backupScore < 70 → Check backup policy
- checklistScore < 70 → Address checklist failures
- automationScore < 70 → Check automation scenarios
- aiScore < 70 → Review AI agent health
- CRITICAL → Schedule emergency maintenance review

## API

```js
calculateClientHealthScore({ checklistScore, securityScore, backupScore, automationScore, aiScore })
// Returns { score, label, breakdown, recommendations }

compareHealthScores(previous, current)
// Returns { valid, previous, current, delta, trend: 'IMPROVING'|'STABLE'|'DECLINING' }
```

## Defaults
Dimensions not provided default to 100 (not penalized if not audited).
