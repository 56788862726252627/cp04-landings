# ADV-17 — Agent Evaluation V2 & Efficiency Score

## EVAL_DIMENSION_V2 (12 dimensions)
```
TASK_COMPLETION | QUALITY | EFFICIENCY | SAFETY
DELEGATION_QUALITY | AGENT_SELECTION | HANDOFF_QUALITY
CONFLICT_RESOLUTION | SHARED_CONTEXT_SAFETY | PARALLELISM_QUALITY
AUTONOMY_COMPLIANCE | SUPERVISOR_QUALITY
```
Overall = average across all dimensions.

## Efficiency Score — Penalty Factors
| Factor | Penalizes |
|---|---|
| Excess agents | More agents than objective requires |
| Duplicate tasks | Same task decomposed twice |
| Unnecessary delegations | Delegation that added no value |
| Context bloat | Shared context > configured limit |
| Excess retries | Retries beyond maxRetries |
| Excess critic cycles | Critic loops beyond maxCycles |

## Decision Summary
`chainOfThought: null` — never surfaced.  
Exposes: task count, agent IDs, handoff count, conflict count, approval count, outcome.

## Response Composer
`agentsExposed: false` — internal agent topology never shown to end user.  
End-user sees only composed answer, not which agents were involved.
