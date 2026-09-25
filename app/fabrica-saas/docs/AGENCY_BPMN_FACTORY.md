# BPMN Factory Flow

## Lanes
- Business Analyzer (DEVELOPER): analyze, vertical, branding, modules, roles, data model
- Factory (DEVELOPER): generate, build, artifacts
- AI Router (AI_SPECIALIST): experience selection, AI planning
- Automation (AUTOMATION_SPECIALIST): Make planning
- QA: functional, dead controls, mobile, security review
- Human Review (AGENCY_OWNER): HUMAN_REVIEW tasks

## Key Gateways
- gw_brief_valid: proceed or request clarification
- gw_functional_qa: pass or rework
- gw_build_pass: proceed or fix
- gw_security_ok: proceed or rework
- gw_human_review: optional human review before artifacts
- pgw_ai_make_split/join: parallel AI + Make planning

## Parallel Gateway
AI planning and Make planning run in parallel before generation.
