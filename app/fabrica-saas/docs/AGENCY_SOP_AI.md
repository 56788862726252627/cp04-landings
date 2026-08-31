# AI Agent SOP

## Risk Tiers
| Tier | Data Access | Memory | Release Gate |
|------|------------|--------|-------------|
| LOW | READ_ONLY | SESSION_ONLY | QA_GATE |
| MEDIUM | READ/WRITE internal | SESSION_ONLY | QA_GATE |
| HIGH | External/PII/Financial | SESSION_ONLY or ENCRYPTED | HUMAN_REVIEW |

## Mandatory Policies
- Human escalation always available
- forbiddenActions list must be non-empty
- No real API keys in agent config
- HIGH risk → HUMAN_REVIEW gate mandatory
- SESSION_ONLY memory unless explicitly approved

## Agent Types
CHATBOT, BOOKING_BOT, CRM_BOT, REPORT_BOT, INTAKE_BOT, CUSTOM
