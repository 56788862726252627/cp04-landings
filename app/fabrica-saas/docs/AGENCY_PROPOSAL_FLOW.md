# Proposal Flow (onboardingToProposal)

## Pipeline Steps
1. validateOnboarding — required fields check
2. qualifyLead — fit scoring (QUALIFIED/HUMAN_REVIEW continue; NOT_A_FIT/NEEDS_MORE_INFO exit)
3. diagnoseBusiness — extract pain points and opportunities
4. buildRequirements — structured requirements by type and priority
5. recommendCommercialPackage — ESSENTIAL/PRO/PREMIUM selection
6. generateEstimate — setup range, monthly range, third-party costs
7. generateProposal — 13-section proposal document
8. Contamination check — no cp04/aurora/fisionova/educa refs

## Exit Conditions
| Decision | Action |
|----------|--------|
| NOT_A_FIT | Return proposalReady=false, nextStep: discard lead |
| NEEDS_MORE_INFO | Return proposalReady=false, nextStep: gather data |
| HUMAN_REVIEW | Continue pipeline + flag humanReviewRequired=true |
| QUALIFIED | Full pipeline, proposalReady=true |

## Disclaimer
All proposals include: "ESTIMACION / NO CONTRACT / NO AUTOMATIC COMMITMENT"
