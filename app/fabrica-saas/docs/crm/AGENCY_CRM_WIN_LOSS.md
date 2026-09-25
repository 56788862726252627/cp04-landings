# Agency CRM Win/Loss Analysis — ADV-09

## Loss Reasons

PRICE_TOO_HIGH / NO_BUDGET / COMPETITOR_CHOSEN / NO_DECISION / TIMING_NOT_RIGHT / POOR_FIT / LOST_CONTACT / INTERNAL_PRIORITY_CHANGE / OTHER

## Won Deal Handoff

After a WON outcome, `createWonDealHandoff()` packages:
- Deal terms (agreedSetup, agreedMonthly, service, modules)
- Key contacts, onboarding notes, kickoff date
- Implementation timeline
- Assigned delivery owner
- Handoff status: PENDING → IN_PROGRESS → COMPLETED

## Aggregation

`aggregateLossReasons(analyses)` returns top loss reason and counts by category for retrospectives.
