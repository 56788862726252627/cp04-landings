# ADV-17 — Team Presets & Bridges

## Team Presets (7)
| Preset | Roles |
|---|---|
| SALES | LEAD + SALES + CRM |
| BOOKING | CHAT + BOOKING |
| SUPPORT | CHAT + SUPPORT |
| CONTENT | RESEARCH + CONTENT + MEDIA |
| LEAD | LEAD + RESEARCH |
| OPERATIONS | QA + OPERATIONS + CRM |
| GENERAL_ASSISTANT | CHAT |

Supervisor role: always SUPERVISOR.

## Bridges (9)
| Bridge | Connects to |
|---|---|
| observabilityBridge | ADV-01 — 12 events, sanitizes secrets/chain-of-thought |
| v1CompatibilityBridge | ADV-03/prev — single-agent fallback |
| aiRouterBridge | ADV-16 — model alias per agent, supervisor recommendation non-binding |
| mcpBridge | ADV-12 — per-agent allowedMCP servers + tool validation |
| businessTruthBridge | ADV-10b — grounds outputs, bypass always false |
| cicdBridge | ADV-02 — 5 CI checks, deploy requires human approval |
| productionBridge | ADV-04 — 6 pre-flight checks, sign-off never auto |
| leadEngineBridge | ADV-08 — qualify + score + handoff to SALES |
| crmBridge | ADV-09 — write requests with idempotency + approval for EXPORT |

## Fixture Sets
- `TEAM_FIXTURES` — 6 pre-built teams
- `GOOD_WORKFLOW_FIXTURES` — 30 success scenarios
- `FAILURE_WORKFLOW_FIXTURES` — 12 blocked/failure scenarios
