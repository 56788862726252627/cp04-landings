# Production Readiness Gate

## P0 Checks (all must pass to unblock production)
| Check ID | Condition |
|----------|-----------|
| scope_approved | approval.decision === PROPOSAL_ACCEPTED |
| requirements_ready | scope.includedScope.length > 0 |
| no_credential_storage | Always passes (policy) |
| decision_maker_identified | onboarding.decisionMaker is set |
| dependencies_known | scope.thirdPartyDependencies.length > 0 |
| integrations_classified | all deps have responsibility field |
| human_approval_confirmed | decision === PROPOSAL_ACCEPTED |

## P1 Checks (non-blocking warnings)
- budget_assumptions_documented
- timeline_assumptions_documented
- data_migration_status
- legal_compliance_flags

## Return
```js
{ ready: bool, status: 'PRODUCTION_READY'|'BLOCKED', checks: [], blocks: [], criticalPassed, warnings: [] }
```
