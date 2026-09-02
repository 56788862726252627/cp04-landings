// Social Content Engine — ADV-14 barrel export

// Core
export { SOCIAL_OBJECTIVE, getObjectiveLabel, listObjectives }           from './core/socialObjective.js';
export { CONTENT_PILLAR, createContentPillar, getRecommendedPillarSet }  from './core/contentPillar.js';
export { STRATEGY_MATURITY, createSocialStrategyProfile }                from './core/socialStrategyProfile.js';
export { SOCIAL_COPY_STYLE, getCopyStyleMeta, listCopyStyles }           from './core/socialCopyStyle.js';
export { CADENCE_PRESET, createSocialCadencePolicy, evaluateCadenceCompliance } from './core/socialCadencePolicy.js';
export { createSocialContentBrief }                                       from './core/socialContentBrief.js';

// Strategy
export { resolveSocialStrategy }                                          from './strategy/resolveSocialStrategy.js';
export { LOCAL_POLICY_RULE, createLocalBusinessContentPolicy, validateAgainstLocalPolicy } from './strategy/localBusinessContentPolicy.js';
export { SEASON, getSeasonForMonth, getSeasonalContext, generateSeasonalContentAngle }     from './strategy/socialSeasonalityEngine.js';

// Ideas
export { checkContentNovelty, NOVELTY_STATUS }                           from './ideas/contentNoveltyEngine.js';
export { scoreContentIdea }                                              from './ideas/contentIdeaScore.js';
export { generateContentIdeas }                                          from './ideas/generateContentIdeas.js';

// Generators
export { HOOK_TYPE, generateHook, getBestHookForObjective }              from './generators/socialHookEngine.js';
export { CTA_TYPE, generateCTA, getBestCTAForObjective }                 from './generators/socialCTAEngine.js';
export { generateHashtags }                                              from './generators/hashtagStrategy.js';
export { createSocialDiscoveryProfile }                                  from './generators/socialDiscoveryProfile.js';
export { generateSocialPost }                                            from './generators/generateSocialPost.js';

// Platforms
export { SOCIAL_MEDIA_TYPE, resolveSocialMediaType }                     from './platforms/resolveSocialMediaType.js';
export { INSTAGRAM_LIMITS, adaptForInstagramReel, adaptForInstagramStory } from './platforms/instagramAdapter.js';
export { FACEBOOK_LIMITS, adaptForFacebook }                             from './platforms/facebookAdapter.js';
export { TIKTOK_LIMITS, adaptForTikTok }                                 from './platforms/tiktokAdapter.js';
export { YOUTUBE_LIMITS, adaptForYouTubeShort, adaptForYouTubeLong }    from './platforms/youtubeAdapter.js';
export { LINKEDIN_LIMITS, adaptForLinkedIn }                             from './platforms/linkedinAdapter.js';
export { X_LIMITS, adaptForX }                                           from './platforms/xAdapter.js';
export { THREADS_LIMITS, adaptForThreads }                               from './platforms/threadsAdapter.js';
export { evaluateChannelDifferentiation }                                from './platforms/channelDifferentiationEvaluator.js';

// Repurposing
export { repurposeContent }                                              from './repurposing/repurposeContent.js';
export { SERIES_TYPE, createContentSeries }                              from './repurposing/contentSeries.js';

// Calendar
export { CALENDAR_STATUS, createSocialContentCalendarEntry, transitionCalendarStatus } from './calendar/socialContentCalendar.js';
export { evaluateContentCalendarBalance }                                from './calendar/evaluateContentCalendarBalance.js';

// Quality
export { computeSocialContentQualityScore }                              from './quality/socialContentQualityScore.js';
export { SOCIAL_GATE_STATUS, SOCIAL_CRITICAL_FAILURE, evaluateSocialContentQualityGate } from './quality/socialContentQualityGate.js';
export { evaluateSocialBrandConsistency }                                from './quality/socialBrandConsistencyEvaluator.js';
export { evaluateSocialHumanness }                                       from './quality/socialHumannessEvaluator.js';

// Policies
export { SOCIAL_APPROVAL_TRIGGER, evaluateSocialApproval }               from './policies/socialContentApprovalPolicy.js';
export { ADS_EXECUTION, ADS_STATUS, evaluateAdsPolicy, createAdsPlan }  from './policies/socialAdsPolicy.js';
export { CHANNEL_AUTH_STATUS, createChannelAuthStatus, evaluateChannelAuth, channelFallback } from './policies/socialChannelAuthStatus.js';
export { PRIVACY_RISK, validateSocialContentPrivacy }                    from './policies/socialContentPrivacyPolicy.js';

// Make
export { SOCIAL_AUTOMATION_STATUS, evaluateSocialAutomationStatus }      from './make/socialAutomationStatus.js';
export { createSocialMakePayload }                                        from './make/socialMakePayload.js';
export { MAKE_BRIDGE_MODE, runSocialMakePipeline }                       from './make/socialMakeBridge.js';

// Campaigns
export { CAMPAIGN_STATUS, CAMPAIGN_TYPE, createSocialCampaign }          from './campaigns/socialCampaign.js';
export { generateSocialCampaignPlan }                                    from './campaigns/generateSocialCampaignPlan.js';

// Bridges
export { bridgeToAIMedia }                                               from './bridges/socialMediaBridge.js';
export { bridgeToLeadEngine }                                            from './bridges/socialLeadEngineBridge.js';
export { bridgeToCRM }                                                   from './bridges/socialCRMBridge.js';
export { bridgeToAgentEngine }                                           from './bridges/socialAgentBridge.js';
export { createSocialMCPRequest }                                        from './bridges/socialMCPBridge.js';
export { SOCIAL_OBS_EVENT, emitSocialEvent }                             from './bridges/socialObservabilityBridge.js';

// Reporting
export { createSocialContentReport }                                     from './reporting/socialContentReport.js';
export { computeSocialEngineQualityScore }                               from './reporting/socialEngineQualityScore.js';

// Fixtures
export * from './fixtures/fixtureBusinesses.js';
export * from './fixtures/fixtureCampaigns.js';
export * from './fixtures/fixtureContentItems.js';
export * from './fixtures/goodFixtures.js';
export * from './fixtures/failureFixtures.js';
export * from './fixtures/makePayloadFixtures.js';

export const SOCIAL_CONTENT_LAYER_VERSION = '1.0.0';
export const ADV14_STATUS = '100_PERCENT';

export const SOCIAL_CONTENT_GUARDRAILS = Object.freeze({
  FACTORY_AGENCY_SCOPE_ONLY: 'SI',
  NO_REAL_SOCIAL_PUBLISH:    'SI',
  NO_REAL_AD_SPEND:          'SI',
  NO_REAL_OUTREACH:          'SI',
  NO_REAL_EXTERNAL_COST:     'SI',
  ADS_EXECUTION:             'BLOCKED',
  MAKE_BRIDGE:               'DRY_RUN_ONLY',
});
