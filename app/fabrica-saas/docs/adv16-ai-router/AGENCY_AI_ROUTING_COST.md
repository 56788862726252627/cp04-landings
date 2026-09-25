# AI Routing Cost Policy — ADV-16

## Cost Classes

FREE → VERY_LOW → LOW → MEDIUM → HIGH → UNKNOWN

## Cost Guard Blocks

- UNKNOWN cost on paid provider → BLOCKED
- HIGH cost without budget policy → BLOCKED  
- Provider not in approved list → BLOCKED
- Budget exceeded → BLOCKED
- Requires human approval (HIGH) → WARN

## Budget Modes

UNLIMITED | MONITORED | CAPPED | FREE_ONLY

No real billing in ADV-16. Classification only.
