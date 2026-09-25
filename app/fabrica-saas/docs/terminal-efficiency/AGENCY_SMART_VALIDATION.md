# Agency Smart Validation — ADV-05

## Decision tree
1. changedFiles → changeImpactAnalyzer → LOW/MEDIUM/HIGH/CRITICAL
2. LOW → FAST mode (targeted tests + lint)
3. MEDIUM → MODULE mode (module tests + lint)
4. HIGH/CRITICAL → FULL mode (full suite + build + security)
5. Final gate → always FULL mode regardless of impact

## Cache policy
- Cache: TESTS, LINT, BUILD, DOCS_CHECK
- Never cache: SECRET_SCAN, SECURITY_AUDIT, DEPLOY, BILLING
- TTL: 5 minutes
- Invalidated on: new commit SHA or explicit file change

## Fail-fast chain
SYNTAX → IMPORT → SECRET_SCAN → TARGETED_TESTS → LINT → FULL_TESTS → BUILD → DEPLOY_READY
