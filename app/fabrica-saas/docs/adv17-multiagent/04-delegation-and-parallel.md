# ADV-17 — Delegation Engine & Parallel Execution

## Delegation Pipeline
```
validate task → select agent → check permissions → build context → execute (fixture) → report
```
`DELEGATION_STATUS`: SUCCESS | FAILED_SELECTION | FAILED_PERMISSION | FAILED_BUDGET | FAILED_QUALITY | BLOCKED

## Parallel Execution Planner
`EXEC_CLASSIFICATION`:
- `PARALLEL_SAFE` — read-only or independent tasks
- `SEQUENTIAL_REQUIRED` — multiple write tasks to same resource
- `HUMAN_REQUIRED` — tasks with APPROVAL type
- `BLOCKED` — policy prevents execution

## Write Coordinator
- `tryAcquire(resource, taskId)` → CONFLICT if different task holds resource
- `release(resource)` — releases lock
- `recordIdempotent(key, result)` / `getIdempotent(key)` — TTL-based dedup window
- No real external writes; all coordinated through fixture simulation

## Delegation Contract
Each delegation specifies:
- `allowedFacts`, `allowedTools`, `allowedWrites`
- `budgetClass`, `timeoutMs`, `escalationPolicy`
- `stopConditions` — when the delegated agent should terminate
