# Agent Tools Policy — ADV-03

## Principle: LEAST_PRIVILEGE

Each agent type gets only the tools it needs for its role.
No agent has access to tools it doesn't use.

## Tool Catalogue (14 tools)

| Tool | Risk | Notes |
|------|------|-------|
| READ_FAQ | LOW | Always available |
| READ_CATALOG | LOW | Always available |
| CHECK_AVAILABILITY | LOW | Booking/support only |
| CONFIRM_BOOKING | MEDIUM | Booking agents |
| SEND_EMAIL | HIGH | Requires human approval |
| SEND_WHATSAPP | HIGH | Requires human approval |
| READ_CRM | MEDIUM | Sales/lead agents |
| WRITE_CRM | HIGH | Lead agents, human approval |
| CANCEL_BOOKING | HIGH | Support, human approval |
| RESCHEDULE_BOOKING | MEDIUM | Booking/support |
| TRANSFER_HUMAN | LOW | All agents |
| LOOKUP_PRICING | LOW | Sales/booking |
| CREATE_LEAD | MEDIUM | Lead agents |
| ESCALATE_TICKET | MEDIUM | Support agents |

## Human Approval Required

`SEND_EMAIL`, `SEND_WHATSAPP`, `CANCEL_BOOKING` — these tools require explicit human approval before execution.

## Default Tool Sets by Agent Type

- **CHAT**: READ_FAQ, READ_CATALOG, TRANSFER_HUMAN
- **SALES**: READ_CATALOG, LOOKUP_PRICING, READ_CRM, TRANSFER_HUMAN
- **SUPPORT**: CHECK_AVAILABILITY, CANCEL_BOOKING, RESCHEDULE_BOOKING, ESCALATE_TICKET, TRANSFER_HUMAN
- **BOOKING**: CHECK_AVAILABILITY, CONFIRM_BOOKING, RESCHEDULE_BOOKING, TRANSFER_HUMAN
- **LEAD**: READ_CATALOG, LOOKUP_PRICING, READ_CRM, CREATE_LEAD, WRITE_CRM, SEND_EMAIL, TRANSFER_HUMAN
- **VOICE**: READ_FAQ, CHECK_AVAILABILITY, TRANSFER_HUMAN
