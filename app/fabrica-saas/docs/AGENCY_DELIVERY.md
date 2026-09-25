# Delivery

## Delivery Readiness Gate (deliveryReady)
### P0 (critical — all must pass)
1. functional_qa — qa component status DONE
2. dead_control_qa — no broken buttons/actions (verified in QA)
3. mobile_qa — responsive design verified
4. build_passes — app component DONE
5. security_review — security component DONE
6. documentation_ready — documentation component DONE

### P1 (non-blocking)
- accessibility (WCAG AA basic)
- privacy_check (GDPR/health data)
- credentials_handoff_plan
- backup_plan
- support_plan
- client_responsibilities documented
- known_limitations documented

## Delivery Manifest (generateDeliveryManifest)
Contains: projectSummary, deliveredScope, modules, roles, integrations, automations/AI manifest, credentialsNeeded (plan only — NO real secrets), setupInstructions, adminInstructions, userInstructions, knownLimitations, thirdPartyCosts, maintenancePlan, rollbackNotes, futureImprovements.

**Disclaimer**: "Este documento NO incluye contrasenas, tokens, ni secretos."
