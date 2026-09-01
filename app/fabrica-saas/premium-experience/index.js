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
export { createSurface, buildSurfaceSystem, SURFACE_PROFILE } from './surfaceSystem.js';
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
export { createPremiumEmptyState, EMPTY_STATE_TYPE } from './emptyStateExperience.js';
export { createPremiumErrorState, ERROR_STATE_TYPE } from './errorStateExperience.js';
export { createLoadingExperience, LOADING_PATTERN } from './loadingExperience.js';

// ─── Motion & Interactions ───────────────────────────────────────────────────
export { buildInteractionSuite } from './microinteractionEngine.js';
export { createMotionPolicy, evaluateMotionPolicy } from './motionSystem.js';

// ─── CTAs & Hero ─────────────────────────────────────────────────────────────
export { resolveCTAHierarchy, evaluateCTACrowding } from './ctaResolver.js';
export { resolveHeroPattern } from './heroExperienceResolver.js';

// ─── Brand & Identity ────────────────────────────────────────────────────────
export { resolveBrandPersonality, combineBrandPersonalities } from './brandPersonalityResolver.js';
export { createIconProfile } from './iconProfile.js';
export { resolveUXCopy } from './uxCopyResolver.js';

// ─── Role & Audience ─────────────────────────────────────────────────────────
export { resolveRoleExperience } from './roleExperienceResolver.js';

// ─── Responsive ──────────────────────────────────────────────────────────────
export { MIN_TAP_TARGET, validateMobileTargets } from './mobileExperienceProfile.js';
export { resolveTabletLayout } from './tabletExperienceProfile.js';
export { resolveDesktopLayout } from './desktopExperienceProfile.js';
export { resolveResponsiveTransform, buildTransformMatrix } from './responsiveTransformationEngine.js';

// ─── Industry Adapters ───────────────────────────────────────────────────────
export { SUPPORTED_VERTICALS, getIndustryAdapter } from './industryVisualAdapters.js';
export { createBusinessOverride, BUSINESS_PROFILE } from './businessExperienceOverride.js';

// ─── Trust & Conversion ──────────────────────────────────────────────────────
export { buildVerticalTrustDesign, TRUST_ELEMENT } from './trustDesignSystem.js';
export { createConversionPolicy, DARK_PATTERN } from './conversionUXPolicy.js';

// ─── Accessibility & Performance ─────────────────────────────────────────────
export { evaluatePremiumAccessibility } from './accessibilityPremium.js';
export { PERF_BUDGET, evaluatePerformanceRisks } from './performanceAwareExperience.js';

// ─── Scoring & Review ────────────────────────────────────────────────────────
export { calculateVisualComplexity } from './visualComplexityScore.js';
export { calculatePremiumExperienceScore } from './premiumExperienceScore.js';
export { evaluatePremiumDesignGate } from './premiumDesignGate.js';
export { createPremiumDesignReview, formatReviewMarkdown } from './premiumDesignReview.js';

// ─── Differentiation & Fit ───────────────────────────────────────────────────
export { evaluateExperienceDifferentiation } from './differentiationEngine.js';
export { evaluateBusinessExperienceFit } from './businessFitEngine.js';
export { createVisualBaseline, compareVisualBaselines, detectLayoutShift } from './visualRegressionFoundation.js';

// ─── Bridges ─────────────────────────────────────────────────────────────────
export { PREMIUM_QA_VIEWPORTS, PREMIUM_QA_PHASES, buildPremiumQAPlan, mapQAResultToPremiumScore } from './bridges/playwrightBridge.js';
export { generateProfileFromBrief } from './bridges/generatorBridge.js';
export { resolveAgentUISurface, buildAgentUIConfig } from './bridges/agentUIBridge.js';
export { PREMIUM_UX_EVENT, createPremiumUXLogger } from './bridges/observabilityBridge.js';
export { PIPELINE_GATE, evaluateProductionReadiness } from './bridges/productionPipelineBridge.js';

// ─── Fixture Metadata ─────────────────────────────────────────────────────────
export { NEXO_VET_PREMIUM } from './fixtures/nexoVetPremiumFixture.js';
export { LEXNOVA_LEGAL } from './fixtures/lexNovaFixture.js';
export { STUDIO_AURA_BEAUTY } from './fixtures/studioAuraFixture.js';
