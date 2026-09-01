// ADV-07 — Premium Experience 10/10
// Barrel export: all modules, bridges, fixture metadata

// ─── Core Profile ────────────────────────────────────────────────────────────
export { BRAND_PERSONALITY, VISUAL_DENSITY, MOTION_LEVEL, createPremiumExperienceProfile, validateProfile } from './premiumExperienceProfile.js';
export { resolvePremiumExperience } from './businessExperienceResolver.js';

// ─── Design Tokens & Typography ──────────────────────────────────────────────
export { generateDesignTokens } from './designTokenEngine.js';
export { TYPOGRAPHY_SCALES, createTypographyProfile, validateTypography } from './typographySystem.js';
export { createSpacingProfile, evaluateSpacingConsistency } from './spacingRhythmEngine.js';

// ─── Surface & Layout ────────────────────────────────────────────────────────
export { createSurface, buildSurfaceSystem, SURFACE_PROFILES } from './surfaceSystem.js';
export { resolveLayoutPattern, createLayoutConfig } from './layoutEngine.js';

// ─── Navigation ──────────────────────────────────────────────────────────────
export { resolveNavigationPattern, buildNavConfig } from './navigationExperienceResolver.js';

// ─── Dashboard & Cards ───────────────────────────────────────────────────────
export { buildDashboardConfig, evaluateDashboardRelevance } from './dashboardExperienceEngine.js';
export { createCard, buildCardGrid } from './cardSystem.js';

// ─── Forms & Data ────────────────────────────────────────────────────────────
export { createFormExperience, evaluateFormQuality } from './formExperience.js';
export { resolveDataPattern } from './dataPresentationResolver.js';

// ─── States ──────────────────────────────────────────────────────────────────
export { createEmptyState, EMPTY_STATE_TYPES } from './emptyStateExperience.js';
export { createErrorState, ERROR_STATE_TYPES } from './errorStateExperience.js';
export { createLoadingExperience, LOADING_PATTERNS } from './loadingExperience.js';

// ─── Motion & Interactions ───────────────────────────────────────────────────
export { buildInteractionSuite } from './microinteractionEngine.js';
export { createMotionPolicy, evaluateMotionPolicy } from './motionSystem.js';

// ─── CTAs & Hero ─────────────────────────────────────────────────────────────
export { MAX_COMPETING_CTAS, resolveCTAHierarchy, evaluateCTACrowding } from './ctaResolver.js';
export { resolveHeroPattern } from './heroExperienceResolver.js';

// ─── Brand & Identity ────────────────────────────────────────────────────────
export { resolveBrandPersonality, combineBrandPersonalities } from './brandPersonalityResolver.js';
export { getIconProfile } from './iconProfile.js';
export { resolveUXCopy } from './uxCopyResolver.js';

// ─── Role & Audience ─────────────────────────────────────────────────────────
export { resolveRoleExperience } from './roleExperienceResolver.js';

// ─── Responsive ──────────────────────────────────────────────────────────────
export { MIN_TAP_TARGET, validateMobileTargets } from './mobileExperienceProfile.js';
export { resolveTabletExperience } from './tabletExperienceProfile.js';
export { resolveDesktopExperience } from './desktopExperienceProfile.js';
export { resolveResponsiveTransform, buildTransformMatrix } from './responsiveTransformationEngine.js';

// ─── Industry Adapters ───────────────────────────────────────────────────────
export { SUPPORTED_VERTICALS, getIndustryAdapter } from './industryVisualAdapters.js';
export { getBusinessExperienceOverride, BUSINESS_PROFILES } from './businessExperienceOverride.js';

// ─── Trust & Conversion ──────────────────────────────────────────────────────
export { buildTrustDesignSystem, TRUST_ELEMENTS } from './trustDesignSystem.js';
export { buildConversionPolicy, PROHIBITED_DARK_PATTERNS } from './conversionUXPolicy.js';

// ─── Accessibility & Performance ─────────────────────────────────────────────
export { evaluatePremiumAccessibility } from './accessibilityPremium.js';
export { PERF_BUDGET, evaluatePerformanceBudget } from './performanceAwareExperience.js';

// ─── Scoring & Review ────────────────────────────────────────────────────────
export { calculateVisualComplexity } from './visualComplexityScore.js';
export { calculatePremiumExperienceScore } from './premiumExperienceScore.js';
export { evaluatePremiumDesignGate } from './premiumDesignGate.js';
export { runPremiumDesignReview, formatReviewMarkdown } from './premiumDesignReview.js';

// ─── Differentiation & Fit ───────────────────────────────────────────────────
export { DIFFERENTIATING_DIMENSIONS, evaluateExperienceDifferentiation } from './differentiationEngine.js';
export { evaluateBusinessFit } from './businessFitEngine.js';
export { createVisualBaseline, compareVisualBaselines, detectLayoutShift } from './visualRegressionFoundation.js';

// ─── Bridges ─────────────────────────────────────────────────────────────────
export { PREMIUM_QA_VIEWPORTS, PREMIUM_QA_PHASES, buildPremiumQAPlan, mapQAResultToPremiumScore } from './bridges/playwrightBridge.js';
export { generateProfileFromBrief } from './bridges/generatorBridge.js';
export { resolveAgentUISurface, buildAgentUIConfig } from './bridges/agentUIBridge.js';
export { PREMIUM_UX_EVENTS, createPremiumUXLogger } from './bridges/observabilityBridge.js';
export { PIPELINE_GATE, evaluateProductionReadiness } from './bridges/productionPipelineBridge.js';

// ─── Fixture Metadata ─────────────────────────────────────────────────────────
export { NEXO_VET_PREMIUM } from './fixtures/nexoVetPremiumFixture.js';
export { LEXNOVA_LEGAL } from './fixtures/lexNovaFixture.js';
export { STUDIO_AURA_BEAUTY } from './fixtures/studioAuraFixture.js';
