# Qualification Engine

## Scoring
| Signal | Points |
|--------|--------|
| budgetRange | 0-2 |
| desiredTimeline | 0-2 |
| decisionMaker | 1 |
| businessGoals | 2 |
| sector known | 1 |

## Decisions
- **QUALIFIED** — fitScore >= 3, no blockers
- **HUMAN_REVIEW** — riskScore >= 3 or high_privacy_risk flag
- **NEEDS_MORE_INFO** — missingCriticalInfo (no decisionMaker, no goals)
- **NOT_A_FIT** — budget_too_low or timeline_unrealistic

## Budget Range Keys
less_than_500 | 500_to_1000 | 1000_to_2500 | 2500_to_5000 | 5000_to_10000 | more_than_10000 | unknown
