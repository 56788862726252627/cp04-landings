# Agency CRM Engine — ADV-09

Reusable commercial CRM engine for Agency IA. Pure JS, no external dependencies, `isReal: false` on all model output.

## Architecture

```
Lead Engine (ADV-08) ──leadBridge──> CRM
CRM ──bridges──> Agent Engine / Premium Experience / Make / Observability
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `salesPipeline` | 12-stage pipeline enum + helpers |
| `crmLead` | CRM lead record with status/priority |
| `crmOpportunity` | Opportunity lifecycle |
| `crmAccount` | Account record |
| `crmContact` | B2B contact (public data only) |
| `crmActivity` | Activity timeline |
| `crmTask` | Task management with overdue detection |
| `crmDeal` | Proposal + deal records |

## Pipeline Stages

NEW → RESEARCH → QUALIFIED → DISCOVERY → SOLUTION_FIT → PROPOSAL_PREP → PROPOSAL_SENT → NEGOTIATION → WAITING_CLIENT → WON (+ LOST, NURTURE)

## Guardrails

- All output: `isReal: false`
- No external calls, no real outreach, no real billing
- PII minimization: only public B2B contact data
