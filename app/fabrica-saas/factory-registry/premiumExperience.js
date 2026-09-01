// Factory Registry — Premium Experience 10/10 (ADV-07)

export const PREMIUM_EXPERIENCE_REGISTRY = Object.freeze({
  id:          'premium-experience',
  name:        'Premium Experience Engine',
  version:     '1.0.0',
  improvement: 'ADV-07',
  description: 'Reusable premium UX/design system engine — auto-adapts layout, typography, navigation, motion, forms, dashboards, cards, states and branding by vertical/business/role/context',

  modules: [
    // Core profile
    'premiumExperienceProfile', 'businessExperienceResolver',
    // Design tokens & typography
    'designTokenEngine', 'typographySystem', 'spacingRhythmEngine',
    // Surface & layout
    'surfaceSystem', 'layoutEngine',
    // Navigation
    'navigationExperienceResolver',
    // Dashboard & cards
    'dashboardExperienceEngine', 'cardSystem',
    // Forms & data
    'formExperience', 'dataPresentationResolver',
    // States
    'emptyStateExperience', 'errorStateExperience', 'loadingExperience',
    // Motion & interactions
    'microinteractionEngine', 'motionSystem',
    // CTAs & hero
    'ctaResolver', 'heroExperienceResolver',
    // Brand & identity
    'brandPersonalityResolver', 'iconProfile', 'uxCopyResolver',
    // Role & audience
    'roleExperienceResolver',
    // Responsive
    'mobileExperienceProfile', 'tabletExperienceProfile', 'desktopExperienceProfile',
    'responsiveTransformationEngine',
    // Industry adapters
    'industryVisualAdapters', 'businessExperienceOverride',
    // Trust & conversion
    'trustDesignSystem', 'conversionUXPolicy',
    // Accessibility & performance
    'accessibilityPremium', 'performanceAwareExperience',
    // Scoring & review
    'visualComplexityScore', 'premiumExperienceScore',
    'premiumDesignGate', 'premiumDesignReview',
    // Differentiation & fit
    'differentiationEngine', 'businessFitEngine', 'visualRegressionFoundation',
    // Bridges
    'playwrightBridge', 'generatorBridge', 'agentUIBridge',
    'observabilityBridge', 'productionPipelineBridge',
  ],

  moduleCount: 45,

  fixtureCount: 3,
  fixtures: ['nexoVetPremium', 'lexNova', 'studioAura'],

  bridgeCount: 5,
  bridges: ['playwright', 'generator', 'agentUI', 'observability', 'productionPipeline'],

  targetScores: {
    VISUAL_SCORE:   9.5,
    UX_SCORE:       9.5,
    BUSINESS_FIT:   9.5,
    RESPONSIVE:     9.5,
  },

  supportedVerticals: [
    'dental', 'physio', 'psychology', 'speech_therapy', 'sports',
    'padel', 'veterinary', 'hairdresser', 'beauty', 'legal',
    'fertility', 'education',
  ],

  playwrightE2E: {
    fixtures: 3,
    viewports: 5,
    checks: ['no-overflow', 'no-blank-screen', 'nav-usable', 'forms-usable', 'differentiation'],
  },

  docs: [
    'AGENCY_PREMIUM_EXPERIENCE_10.md',
    'AGENCY_DESIGN_SYSTEM.md',
    'AGENCY_BUSINESS_SPECIFIC_UX.md',
    'AGENCY_RESPONSIVE_EXPERIENCE.md',
    'AGENCY_PREMIUM_FORMS.md',
    'AGENCY_PREMIUM_DASHBOARDS.md',
    'AGENCY_PREMIUM_STATES.md',
    'AGENCY_PREMIUM_MOTION.md',
    'AGENCY_PREMIUM_ACCESSIBILITY.md',
    'AGENCY_PREMIUM_DESIGN_QA.md',
  ],

  guardrails: Object.freeze({
    NO_PRODUCTION_DEPLOY:    true,
    NO_EXTERNAL_SPEND:       true,
    NO_REAL_SECRETS:         true,
    NO_REAL_PAYMENTS:        true,
    HUMAN_GATE_FOR_MERGE:    true,
    isReal:                  false,
  }),
});
