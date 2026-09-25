# QA SOP

## P0 Checks (blocking)
1. FUNCTIONAL — all features work as specified
2. DEAD_CONTROLS — no broken buttons/links/actions
3. MOBILE — responsive 320px to 1440px
4. BUILD — npm run build passes
5. SECURITY — OWASP basics, no exposed secrets
6. TESTS — all unit/integration tests pass

## P1 Checks (non-blocking, warnings)
- ACCESSIBILITY (WCAG AA basic)
- PRIVACY (GDPR, health data)
- ROLE_ISOLATION
- CROSS_CLIENT_CONTAMINATION
- LINT
- RESPONSIVE
- PERFORMANCE

## Outcomes
- PASS: all P0 pass
- BLOCKED: any P0 fails
- HUMAN_REVIEW: privacy=false
- Score: 0-100 (P0 70pts, P1 30pts)
