# Agent Memory Policy — ADV-03

## Memory Types

| Type | Scope | Persistence |
|------|-------|-------------|
| NONE | No memory | — |
| SESSION | Current conversation | In-memory, lost on close |
| SHORT_TERM | Recent sessions | Pending implementation |
| CRM_BACKED_FUTURE | Full history | Not yet connected |

## Session Memory

`createSessionMemory(agentId)` returns an in-memory store for testing.
- `isReal: false`
- Max turns: 20 (configurable)
- Never stored to disk or database

## Never Store

- Passwords, tokens, credit card numbers
- Medical data beyond session context
- Legal case details beyond session context
- Any data the user hasn't explicitly shared for this purpose

## CRM Integration

`CRM_BACKED_FUTURE` is pre-wired in `knowledgeProfile.js` but disabled by default.
CRM integration requires explicit client configuration and consent.
Not activated in the current factory scope.

## Privacy Rules

- Session memory is scoped to the current `agentId`
- No cross-client contamination (enforced by `clientOverrides.js`)
- `clientId` isolation is mandatory
