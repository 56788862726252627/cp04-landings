# BPMN Incident Flow

## Lanes
- Support: classify, standard response, close
- Project Manager: SEV2 response, contain, escalate, communicate, postmortem
- Developer: investigate, resolve
- QA: verify
- Agency Owner: SEV1 response

## Severity Routing
- SEV1 → AGENCY_OWNER (15 min response)
- SEV2 → PROJECT_MANAGER (1h response)
- SEV3/SEV4 → SUPPORT (4h/24h response)

## Key Flow
Detect → Classify → [SEV routing] → Contain → [if not contained: escalate] → Investigate → Resolve → Verify → Communicate → Postmortem → Close
