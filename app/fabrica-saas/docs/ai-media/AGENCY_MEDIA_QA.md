# QA de Media IA (ADV-13)

## Evaluadores disponibles
| Evaluador | Dimensiones | Output |
|-----------|-------------|--------|
| mediaHookEvaluator | 5 (clarity/relevance/speed/specificity/non-clickbait) | score 0-100 |
| mediaCtaEvaluator | 5 (clarity/relevance/friction/truthfulness/business_fit) | score 0-100 |
| mediaScriptEvaluator | 8 dimensiones | score 0-100 |
| mediaVoiceQualityEvaluator | 6 dimensiones | score 0-100 |
| lipSyncQualityEvaluator | syncQuality → EXCELLENT/GOOD/WARNING/FAIL | score 0-100 |
| avatarQualityEvaluator | 6 dimensiones, criticalFail si no compliant | score 0-100 |

## Quality Gate — Razones de BLOCKED
- UNVERIFIED_CLAIM / MISSING_RIGHTS / MISSING_CONSENT
- BAD_LIPSYNC / WRONG_BRAND / WRONG_FACTS / UNSAFE_CTA
- MISSING_APPROVAL / COST_WITHOUT_APPROVAL
- FAKE_TESTIMONIAL / FALSE_HUMAN_REPR / UNLICENSED_ASSET

## Grades
- A ≥ 90 | B ≥ 75 | C ≥ 60 | F < 60

## Regla de gate
`criticalFailures.length > 0` → BLOCKED (override sobre cualquier score).
