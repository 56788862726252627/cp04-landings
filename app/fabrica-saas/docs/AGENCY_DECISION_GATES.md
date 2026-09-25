# Decision Gates

## Gate Definitions

### COMMERCIAL_GATE
Required: budgetQualified, decisionMakerConfirmed
Blocking: same
Human review trigger: humanReviewRequired

### SCOPE_GATE
Required: scopeDocumentReady, hasP0Requirements
Blocking: scopeDocumentReady, hasP0Requirements, requirementsApproved

### PRODUCTION_GATE
Required: qaPass, securityPass, buildPass, envConfigured
Blocking: qaPass, securityPass, buildPass
Human: agencyOwnerAuthorizes

### QA_GATE
Required: functionalQA, deadControlQA, mobileQA, buildPasses, securityReview, testsPass
All are blocking
Human: privacyHumanReview

### SECURITY_GATE
Required: noSecretsInCode, leastPrivilegeApplied, demoDataClean
Blocking: noSecretsInCode, credentialPlanValid
Human: restrictedDataFound

### DELIVERY_GATE
Required: qaPass, deliveryManifestReady
Blocking: qaPass, deliveryManifestReady, clientAccepts

### CHANGE_GATE
Required: crClassified
Human: scopeChangeApproval

### INCIDENT_GATE
Required: incidentSeverity, incidentOwner
Blocking: containmentInPlace
Human: sev1EscalationRequired

## Gate Outcomes
- PASS: all required present and none blocking failed
- BLOCKED: any blocking check failed
- HUMAN_REVIEW: human approval flag active
- PENDING: required checks missing from context
