// AI Media Engine — ADV-13 barrel

export * from './core/aiMediaProject.js';
export * from './core/mediaObjective.js';
export * from './core/avatarProfile.js';
export * from './core/mediaIdentityConsent.js';
export * from './core/mediaVoiceProfile.js';
export * from './core/spanishVoiceProfiles.js';

export * from './script/mediaScriptEngine.js';
export * from './script/mediaClaimPolicy.js';
export * from './script/mediaScriptLengthPolicy.js';

export * from './channel/mediaChannelProfile.js';
export * from './channel/mediaFormatResolver.js';
export * from './channel/mediaSafeAreaPolicy.js';

export * from './visual/mediaStoryboard.js';
export * from './visual/mediaVisualStyle.js';
export * from './visual/mediaBrandBridge.js';

export * from './providers/avatarVideoProvider.js';
export * from './providers/mediaTTSBridge.js';
export * from './providers/lipSyncProvider.js';
export * from './providers/videoCompositionPlan.js';

export * from './routing/mediaRightsPolicy.js';
export * from './routing/mediaCostGuard.js';
export * from './routing/mediaCostEstimate.js';
export * from './routing/mediaProviderRouter.js';
export * from './routing/mediaHumanApprovalPolicy.js';

export * from './social/socialPublishPlan.js';
export * from './social/mediaAutomationManifest.js';
export * from './social/mediaContentCalendar.js';

export * from './variants/mediaVariantsEngine.js';
export * from './variants/mediaExperiment.js';

export * from './captions/captionEngine.js';
export * from './captions/subtitlePlan.js';

export * from './quality/mediaHookEvaluator.js';
export * from './quality/mediaCtaEvaluator.js';
export * from './quality/mediaScriptEvaluator.js';
export * from './quality/mediaVoiceQualityEvaluator.js';
export * from './quality/lipSyncQualityEvaluator.js';
export * from './quality/avatarQualityEvaluator.js';
export * from './quality/mediaQualityScore.js';
export * from './quality/mediaQualityGate.js';

export * from './accessibility/mediaAccessibilityPolicy.js';
export * from './accessibility/mediaPerformanceProfile.js';

export * from './bridges/mediaLandingBridge.js';
export * from './bridges/mediaAgentBridge.js';
export * from './bridges/mediaVoiceAgentBridge.js';
export * from './bridges/mediaMCPBridge.js';
export * from './bridges/mediaObservabilityBridge.js';
export * from './bridges/mediaLangfuseBridge.js';

export * from './privacy/mediaPrivacyPolicy.js';
export * from './privacy/mediaRetentionPolicy.js';
export * from './privacy/mediaProvenance.js';
export * from './privacy/syntheticMediaDisclosurePolicy.js';

export * from './output/mediaOutputPackage.js';
export * from './output/thumbnailPlan.js';

export const AI_MEDIA_LAYER_VERSION = '1.0.0';
export const ADV13_STATUS = '100_PERCENT';
