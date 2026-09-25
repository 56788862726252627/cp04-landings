# ADV-07 — Premium Experience Engine 10/10

**Version:** 1.0.0 | **Status:** LOCAL ONLY — NO MERGE sin autorización humana explícita | **isReal:** false

## Objetivo

Motor de experiencia premium reutilizable que auto-adapta layout, tipografía, navegación, motion, formularios, dashboards, tarjetas, estados y branding por vertical/negocio/rol/contexto.

## Puntuaciones objetivo

| Dimensión | Target |
|-----------|--------|
| VISUAL_SCORE | ≥ 9.5/10 |
| UX_SCORE | ≥ 9.5/10 |
| BUSINESS_FIT | ≥ 9.5/10 |
| RESPONSIVE | ≥ 9.5/10 |

## Módulos (45 total)

### Core
- `premiumExperienceProfile` — Schema de perfil + validación
- `businessExperienceResolver` — Resolver por vertical (12 soportadas)

### Diseño
- `designTokenEngine` — Tokens: espaciado, radio, elevación, foco, motion
- `typographySystem` — 7 perfiles tipográficos
- `spacingRhythmEngine` — Espaciado por densidad visual
- `surfaceSystem` — 4 paletas de superficie × 9 tipos

### Layout & Navegación
- `layoutEngine` — Patrones de layout por vertical
- `navigationExperienceResolver` — Patrones de nav por contexto

### Componentes
- `dashboardExperienceEngine` — Widgets por vertical/rol
- `cardSystem` — 12 variantes × 6 estados
- `formExperience` — Formularios con evaluación de calidad
- `dataPresentationResolver` — TABLE/CARDS/LIST/KANBAN/CALENDAR

### Estados
- `emptyStateExperience`, `errorStateExperience`, `loadingExperience`

### Motion & Interacción
- `microinteractionEngine` — 10 interacciones por nivel de motion
- `motionSystem` — Política de animación por nivel

### CTAs & Hero
- `ctaResolver` — Jerarquía CTA, detección de crowding
- `heroExperienceResolver` — Hero pattern por vertical

### Identidad
- `brandPersonalityResolver`, `iconProfile`, `uxCopyResolver`

### Roles
- `roleExperienceResolver`

### Responsive
- `mobileExperienceProfile`, `tabletExperienceProfile`, `desktopExperienceProfile`, `responsiveTransformationEngine`

### Adaptadores
- `industryVisualAdapters` — 12 verticales
- `businessExperienceOverride` — 5 perfiles de negocio

### Calidad & Scoring
- `trustDesignSystem`, `conversionUXPolicy`
- `accessibilityPremium`, `performanceAwareExperience`
- `visualComplexityScore`, `premiumExperienceScore`
- `premiumDesignGate`, `premiumDesignReview`
- `differentiationEngine`, `businessFitEngine`, `visualRegressionFoundation`

### Bridges (5)
- `playwrightBridge`, `generatorBridge`, `agentUIBridge`
- `observabilityBridge`, `productionPipelineBridge`

## Tests

- **189 unit tests** — `node --test` (node:test/assert/strict)
- **57 Playwright E2E** — Contra 3 fixtures HTML reales, headless Chromium

## Verticales soportadas

dental, physio, psychology, speech_therapy, sports, padel, veterinary, hairdresser, beauty, legal, fertility, education

## Guardrails

```
NO_PRODUCTION_DEPLOY=SI | NO_EXTERNAL_SPEND=SI
NO_REAL_SECRETS=SI | NO_REAL_PAYMENTS=SI
HUMAN_GATE_FOR_MERGE=SI | isReal=false (siempre)
```
