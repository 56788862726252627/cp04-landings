# ADV-17 — Handoff Types & Conflict Resolution

## Handoff Types (8)
| Type | From → To |
|---|---|
| CHAT_TO_BOOKING | Chat → Booking |
| LEAD_TO_SALES | Lead → Sales |
| SALES_TO_CRM | Sales → CRM |
| SUPPORT_TO_HUMAN | Support → Human |
| VOICE_TO_BOOKING | Voice → Booking |
| CONTENT_TO_MEDIA | Content → Media |
| SOCIAL_TO_MEDIA | Social → Media |
| QA_TO_SUPERVISOR | QA → Supervisor |
| ANY_TO_SUPERVISOR | Any → Supervisor (escalation) |

## Handoff Quality Evaluator
Scores 6 dimensions: contextCompleteness, brevity, correctRecipient, factPreservation, noSensitiveLeakage, nextActionClarity.  
BLOCKED if sensitive data leaked or recipient missing.

## Conflict Resolution Priority
```
CLIENT_SCOPE_CONFLICT → SAFETY
FACT_CONFLICT         → BUSINESS_TRUTH (human if disputed)
action + can serialize → POLICY (serialize)
else                  → HUMAN_REQUIRED
```

## Consensus Policy
`CONSENSUS_METHOD`: MAJORITY | UNANIMOUS | WEIGHTED | SUPERVISOR_CAST  
- `maxCycles = 3` — hard cap, no infinite loops
- `useForTrivial = false` — consensus only for HIGH/CRITICAL decisions

## Critic Policy
- `maxCycles = 2` per output
- QA agent profile: `canExecuteExternalActions: false` always
