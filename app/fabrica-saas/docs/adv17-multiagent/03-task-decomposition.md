# ADV-17 — Task Decomposition & Task Graph

## Task Decomposer
Pattern matching on objective text → minimum sub-tasks:

| Pattern | Tasks generated |
|---|---|
| `book` / `reserv` | RESEARCH + BOOKING + COMMUNICATION + CRM_UPDATE |
| `lead` / `prospect` | QUALIFICATION + RESEARCH + COMMUNICATION + CRM_UPDATE |
| `content` / `post` / `social` | RESEARCH + CONTENT + QA |
| `support` / `help` | RESEARCH + COMMUNICATION + HANDOFF (if needed) |
| (default) | RESEARCH + ANALYSIS |

## Task Graph
- DFS cycle detection (visited + stack sets)
- `getReadyTasks()` — tasks with no pending dependencies
- `criticalPath` — longest dependency chain
- `markRunning()`, `markCompleted()`, `markFailed()`
- `getBlockedTasks()` — tasks blocked by failed dependency

## TASK_STATUS
`PENDING → READY → RUNNING → WAITING → COMPLETED | FAILED | BLOCKED | CANCELLED`

## TASK_RISK
`LOW | MEDIUM | HIGH | CRITICAL`
