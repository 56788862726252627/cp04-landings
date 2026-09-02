# Agency CRM Pipeline — ADV-09

## Stage Definitions

| Stage | Description | Default Stale Threshold |
|-------|-------------|------------------------|
| NEW | Lead imported, not yet researched | 7 days |
| RESEARCH | Active research underway | 10 days |
| QUALIFIED | Budget/authority/need confirmed | 14 days |
| DISCOVERY | Discovery session conducted | 14 days |
| SOLUTION_FIT | Solution mapped to needs | 14 days |
| PROPOSAL_PREP | Proposal being drafted | 7 days |
| PROPOSAL_SENT | Proposal delivered to client | 14 days |
| NEGOTIATION | Active negotiation | 10 days |
| WAITING_CLIENT | Awaiting client decision | 30 days (no CRITICAL_STALE) |
| WON | Deal closed — terminal | — |
| LOST | Deal lost — terminal | — |
| NURTURE | Long-term nurture | Never CRITICAL_STALE |

## Transition Rules

- Forward transitions only (except: LOST→NEW/NURTURE, NURTURE→early stages)
- WON is strictly terminal
- Gates on high-value transitions: PROPOSAL→WON requires explicit confirmation signal
