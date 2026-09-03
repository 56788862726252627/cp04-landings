# ADV-17 — Agent Engine V2: Multi-Agent Overview

## Scope
Factory Agency scope only. No real external actions. No real spend. No real outreach.

## Architecture
Supervisor + Specialist pattern. One supervisor coordinates N specialist agents.

```
Objective
  └─ Supervisor Agent
       ├─ Task Decomposer       → sub-tasks (DFS cycle detection)
       ├─ Dynamic Team Builder  → minimum team for objective
       ├─ Delegation Engine     → selects + delegates to specialists
       ├─ Parallel Planner      → PARALLEL_SAFE vs SEQUENTIAL_REQUIRED
       ├─ Write Coordinator     → resource locks + idempotency
       └─ Quality Gate          → PASS/WARN/FAIL/BLOCKED
```

## Guardrails
- `UNLIMITED_AUTONOMY_FORBIDDEN` — max level is BOUNDED_AUTO; FULL_UNLIMITED does not exist
- `SELF_PERMISSION_GRANT=false` — agents can REQUEST escalation, never grant it
- `CROSS_CLIENT_MEMORY=false` — client boundary enforced on every read/write
- `BUSINESS_TRUTH_BYPASS=false` — all writes grounded against source of truth
- `CHAIN_OF_THOUGHT_EXPOSED=false` — never surfaced in trace, summary, or shared context
- `NO_REAL_EXTERNAL_ACTIONS` — `isReal: false` on all outputs; fixture/simulation only
