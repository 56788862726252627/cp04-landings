# Automation SOP

## Lifecycle
1. Document business need
2. Define trigger
3. Define inputs/outputs
4. Design steps
5. Error handling (RETRY/HUMAN_REVIEW/FAIL_SAFE/SKIP)
6. Human review trigger
7. Security check
8. Write tests
9. Validate on staging
10. Production readiness gate
11. Document in Make manifest

## Production Gate Requirements
- testCoverage: true
- stagingValidated: true
- errorHandling defined
- steps non-empty

## Security
- No real credentials in scenario config
- Webhook URLs not in logs
- Human review trigger required for critical flows

## Compatible with Make manifest (makeCompatible: true)
