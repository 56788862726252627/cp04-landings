# ADV-17 — System State & Autonomy Levels

## SYSTEM_STATE
`IDLE → PLANNING → RUNNING → WAITING_AGENT | WAITING_HUMAN → COMPLETED | FAILED | BLOCKED | CANCELLED`

## AGENT_AUTONOMY_LEVEL
| Level | Description |
|---|---|
| ASSIST_ONLY | Suggests only, no autonomous action |
| PLAN_AND_SUGGEST | Plans and proposes, human executes |
| SAFE_AUTO (default) | Executes safe, reversible actions only |
| BOUNDED_AUTO | Wider scope but within policy bounds |
| HUMAN_CONTROLLED | Every step requires human confirmation |

`FULL_UNLIMITED` does not exist. Default = `SAFE_AUTO`.

## createMultiAgentSystem
```js
const system = createMultiAgentSystem({
  clientId: 'client-padel',
  businessId: 'padel-04',
  vertical: 'padel',
  objective: 'Qualify and close leads',
  supervisorAgent: supervisorDef,
  specialistAgents: [leadSpec, salesSpec, crmSpec],
});
// system.state === 'IDLE', system.isReal === false
```
