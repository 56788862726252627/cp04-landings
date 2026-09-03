# ADV-17 — Reliability: Stop, Loop, Deadlock, Recovery

## Stop Policy (STOP_REASON)
`OBJECTIVE_COMPLETE | BLOCKED_DEPENDENCY | HUMAN_REQUIRED | BUDGET_EXHAUSTED | MAX_STEPS | REPEATED_FAILURE | CONFLICT_UNRESOLVED | QUALITY_GATE_FAIL | TIMEOUT | CANCELLED`

## Loop Detector (LOOP_TYPE)
| Type | Detection |
|---|---|
| SAME_TASK_REPEATED | Same objective ≥ N times |
| PING_PONG_HANDOFF | A→B→A→B in last 4 events |
| SAME_TOOL_RETRY | Same tool call ≥ N times |
| SAME_CRITIQUE_LOOP | Critic same output ≥ maxCycles |
| NO_PROGRESS_CYCLE | Steps run but no state change |

## Deadlock Detector (DEADLOCK_TYPE)
| Type | Detection |
|---|---|
| MUTUAL_WAIT | A waits B, B waits A (wait graph) |
| RESOURCE_LOCK | Lock held indefinitely |
| APPROVAL_DEPENDENCY | Approval waits on another approval |
| CIRCULAR_TASK | Task dependency cycle |

## Recovery Policy (RECOVERY_ACTION)
Priority order:
1. `RESUME_FROM_CHECKPOINT` — preferred if checkpoint available
2. `RETRY_AGENT` — transient failures
3. `REPLACE_AGENT` — role match, then capability match
4. `PARTIAL_RESULT` — return what's done
5. `ESCALATE` / `HUMAN_HANDOFF` / `SAFE_FAILURE`

## Idempotency
`IDEMPOTENCY_DOMAIN`: CRM | BOOKING | COMMUNICATION | AUTOMATION | DEPLOY  
TTL-based key dedup prevents duplicate writes across retries.
