# Production SOP

## Required Checks Before Deploy
1. qa_pass
2. security_pass
3. build_pass
4. delivery_manifest_exists
5. no_critical_open_crs
6. env_variables_configured
7. rollback_plan_exists

## Process
1. Verify all gates
2. Agency owner authorization (REQUIRED)
3. Deploy (human action)
4. Post-deploy smoke test
5. Record deploy in manifest
6. Hand off to client handoff SOP

## On Failure
- Smoke test fails → rollback immediately
- Rollback fails → escalate AGENCY_OWNER + SUPPORT

## Disclaimer
"Deploy execution requires human authorization. This is a readiness check only."
