# ADV-17 — Quality Gate & Security

## Quality Score (10 factors, 100 pts)
| Factor | Weight |
|---|---|
| taskDecomposition | 10 |
| agentSelection | 10 |
| delegation | 10 |
| handoff | 10 |
| businessTruth | 15 |
| permissions | 10 |
| conflictHandling | 10 |
| efficiency | 10 |
| quality | 10 |
| completion | 5 |

## Quality Gate Thresholds
- `PASS` — score ≥ 90
- `WARN` — score 80–89
- `FAIL` — score < 80
- `BLOCKED` — any critical failure present

## MULTIAGENT_BLOCK_REASON (10)
`UNAUTHORIZED_AGENT_ACTION | CROSS_CLIENT_AGENT_MEMORY | INFINITE_AGENT_LOOP | UNSAFE_PARALLEL_WRITE | INVALID_HANDOFF | PERMISSION_SELF_ESCALATION | BUSINESS_TRUTH_BYPASS | UNAPPROVED_EXTERNAL_ACTION | AGENT_DEADLOCK_UNHANDLED | BUDGET_BYPASS`

## Security: Injection Guard (8 patterns blocked)
1. "ignore system policy"
2. "create agent" / "create a new agent"
3. "grant permission" / "grant yourself"
4. "change client id" / "switch client"
5. "authorize spend" / "approve budget"
6. "act as admin"
7. "bypass approval"
8. "disable guardrail"

## Security: Privacy Policy
`DATA_SENSITIVITY`: PUBLIC | INTERNAL | PERSONAL | SENSITIVE  
Cross-client context transfer always blocked.
