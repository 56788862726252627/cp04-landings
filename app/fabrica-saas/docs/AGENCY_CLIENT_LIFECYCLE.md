# Agency Client Lifecycle

## Overview
Complete pipeline from lead to closed project.

## Stages
| Stage | Module | Exit Condition |
|-------|--------|----------------|
| LEAD | — | Onboarding started |
| ONBOARDING | onboardingSchema | All required fields complete |
| QUALIFICATION | qualificationEngine | QUALIFIED or HUMAN_REVIEW |
| DISCOVERY/DIAGNOSIS | diagnosticEngine | Diagnostic complete |
| REQUIREMENTS | requirementsEngine | Requirements document ready |
| SCOPE | scopeBuilder | Scope approved |
| PROPOSAL | proposalPipeline | Proposal generated |
| APPROVAL | approvalModel | Client decision |
| PRODUCTION | productionTracking | All components DONE |
| DELIVERY | deliveryReadiness | Gate passed |
| HANDOFF | handoff | Acceptance checklist complete |
| SUPPORT | supportWindow | Window active |
| CLOSEOUT | clientCloseout | All conditions met |

## Guardrails
- NO real client data
- NO real emails
- NO real payments
- NO secrets stored
- All outputs are DECLARATIVE — not legal contracts

## E2E Entry Point
```js
import { runClientLifecycle } from './lifecycle/lifecycleRunner.js';
const result = await runClientLifecycle(onboardingData, { simulateApprovalDecision: 'PROPOSAL_ACCEPTED', markAllComponentsDone: true });
```
