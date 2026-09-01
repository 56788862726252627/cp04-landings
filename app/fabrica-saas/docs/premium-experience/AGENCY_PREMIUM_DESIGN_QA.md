# Design QA Premium — ADV-07

**isReal:** false | **Módulos:** premiumDesignGate, premiumDesignReview, premiumExperienceScore, differentiationEngine, visualComplexityScore

## Gate de Diseño

`evaluatePremiumDesignGate(report)` — BLOQUEANTE. Devuelve `{ passed, blocked, result, blockingIssues, warnings, isReal }`.

Condiciones de bloqueo:

| Condición | Bloquea si |
|-----------|-----------|
| `hasHorizontalScroll` | true |
| `hasCriticalOverlap` | true |
| `hasUnusableForm` | true |
| `hasDeadCTA` | true |
| `missingNavigation` | true |
| `contrastFailCritical` | true |
| `hasBlankScreen` | true |
| `mobileUnusable` | true |

Un reporte limpio (`result: 'PASS'`) es necesario para que `evaluateProductionReadiness` devuelva `requiresHumanSignOff: true`.

## Score de Experiencia Premium

`calculatePremiumExperienceScore(factors)` — 12 factores ponderados, retorna `{ score: 0-100, ... }`.

**Factores bloqueantes** (score < 50 cualquiera → score final < 50):
- `VISUAL_HIERARCHY`
- `NAVIGATION`
- `RESPONSIVE`

## Complejidad Visual

`calculateVisualComplexity({ CARD_COUNT, COLOR_COUNT, MOTION_ELEMENTS, METRIC_DENSITY, CTA_COUNT, WIDGET_COUNT })` — retorna `{ score, level, breakdown, overloaded }`.

| Nivel | Score |
|-------|-------|
| SIMPLE | 0–30 |
| MODERATE | 31–60 |
| COMPLEX | 61–80 |
| OVERLOADED | 81–100 |

Score OVERLOADED debe resolverse antes de producción.

## Diferenciación de Fixtures

`evaluateExperienceDifferentiation(profiles)` — retorna `{ level, score, avgDifferentDimensions, totalDimensions, isReal }`.

9 dimensiones evaluadas: typographyProfile, surfaceProfile, brandPersonality, motionLevel, navigationPattern, dashboardPattern, heroPattern, contentTone, visualDensity.

Veredictos: `COPY` (< 20%), `MINOR_VARIATION` (< 50%), `GENUINELY_DIFFERENT` (≥ 50%).

Los 3 fixtures de ADV-07 son `GENUINELY_DIFFERENT` en todas las dimensiones.

## Checklist Pre-Producción

- [ ] `premiumDesignGate.passed === true`
- [ ] `premiumExperienceScore ≥ 85`
- [ ] `differentiationEngine.level === 'GENUINELY_DIFFERENT'` (si multifixture)
- [ ] `visualComplexity.level !== 'OVERLOADED'`
- [ ] `accessibilityPremium.level !== 'BASELINE'`
- [ ] Gate de producción abierto por humano (NO automatizable)
