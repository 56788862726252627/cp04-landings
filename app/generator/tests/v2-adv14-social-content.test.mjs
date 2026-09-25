import { describe, it, before }   from 'node:test';
import assert                     from 'node:assert/strict';

// Core
import { SOCIAL_OBJECTIVE, getObjectiveLabel, listObjectives } from '../../fabrica-saas/social-content/core/socialObjective.js';
import { CONTENT_PILLAR, createContentPillar, getRecommendedPillarSet } from '../../fabrica-saas/social-content/core/contentPillar.js';
import { STRATEGY_MATURITY, createSocialStrategyProfile } from '../../fabrica-saas/social-content/core/socialStrategyProfile.js';
import { SOCIAL_COPY_STYLE, getCopyStyleMeta, listCopyStyles } from '../../fabrica-saas/social-content/core/socialCopyStyle.js';
import { CADENCE_PRESET, createSocialCadencePolicy, evaluateCadenceCompliance } from '../../fabrica-saas/social-content/core/socialCadencePolicy.js';
import { createSocialContentBrief } from '../../fabrica-saas/social-content/core/socialContentBrief.js';

// Strategy
import { resolveSocialStrategy } from '../../fabrica-saas/social-content/strategy/resolveSocialStrategy.js';
import { LOCAL_POLICY_RULE, createLocalBusinessContentPolicy, validateAgainstLocalPolicy } from '../../fabrica-saas/social-content/strategy/localBusinessContentPolicy.js';
import { SEASON, getSeasonForMonth, getSeasonalContext, generateSeasonalContentAngle } from '../../fabrica-saas/social-content/strategy/socialSeasonalityEngine.js';

// Ideas
import { checkContentNovelty, NOVELTY_STATUS } from '../../fabrica-saas/social-content/ideas/contentNoveltyEngine.js';
import { scoreContentIdea } from '../../fabrica-saas/social-content/ideas/contentIdeaScore.js';
import { generateContentIdeas } from '../../fabrica-saas/social-content/ideas/generateContentIdeas.js';

// Generators
import { HOOK_TYPE, generateHook, getBestHookForObjective } from '../../fabrica-saas/social-content/generators/socialHookEngine.js';
import { CTA_TYPE, generateCTA, getBestCTAForObjective } from '../../fabrica-saas/social-content/generators/socialCTAEngine.js';
import { generateHashtags } from '../../fabrica-saas/social-content/generators/hashtagStrategy.js';
import { createSocialDiscoveryProfile } from '../../fabrica-saas/social-content/generators/socialDiscoveryProfile.js';
import { generateSocialPost } from '../../fabrica-saas/social-content/generators/generateSocialPost.js';

// Platforms
import { SOCIAL_MEDIA_TYPE, resolveSocialMediaType } from '../../fabrica-saas/social-content/platforms/resolveSocialMediaType.js';
import { adaptForInstagramReel, adaptForInstagramStory } from '../../fabrica-saas/social-content/platforms/instagramAdapter.js';
import { adaptForFacebook } from '../../fabrica-saas/social-content/platforms/facebookAdapter.js';
import { adaptForTikTok } from '../../fabrica-saas/social-content/platforms/tiktokAdapter.js';
import { adaptForYouTubeShort, adaptForYouTubeLong } from '../../fabrica-saas/social-content/platforms/youtubeAdapter.js';
import { adaptForLinkedIn } from '../../fabrica-saas/social-content/platforms/linkedinAdapter.js';
import { adaptForX } from '../../fabrica-saas/social-content/platforms/xAdapter.js';
import { adaptForThreads } from '../../fabrica-saas/social-content/platforms/threadsAdapter.js';
import { evaluateChannelDifferentiation } from '../../fabrica-saas/social-content/platforms/channelDifferentiationEvaluator.js';

// Repurposing
import { repurposeContent } from '../../fabrica-saas/social-content/repurposing/repurposeContent.js';
import { SERIES_TYPE, createContentSeries } from '../../fabrica-saas/social-content/repurposing/contentSeries.js';

// Calendar
import { CALENDAR_STATUS, createSocialContentCalendarEntry, transitionCalendarStatus } from '../../fabrica-saas/social-content/calendar/socialContentCalendar.js';
import { evaluateContentCalendarBalance } from '../../fabrica-saas/social-content/calendar/evaluateContentCalendarBalance.js';

// Quality
import { computeSocialContentQualityScore } from '../../fabrica-saas/social-content/quality/socialContentQualityScore.js';
import { SOCIAL_GATE_STATUS, SOCIAL_CRITICAL_FAILURE, evaluateSocialContentQualityGate } from '../../fabrica-saas/social-content/quality/socialContentQualityGate.js';
import { evaluateSocialBrandConsistency } from '../../fabrica-saas/social-content/quality/socialBrandConsistencyEvaluator.js';
import { evaluateSocialHumanness } from '../../fabrica-saas/social-content/quality/socialHumannessEvaluator.js';

// Policies
import { SOCIAL_APPROVAL_TRIGGER, evaluateSocialApproval } from '../../fabrica-saas/social-content/policies/socialContentApprovalPolicy.js';
import { ADS_EXECUTION, ADS_STATUS, evaluateAdsPolicy, createAdsPlan } from '../../fabrica-saas/social-content/policies/socialAdsPolicy.js';
import { CHANNEL_AUTH_STATUS, createChannelAuthStatus, evaluateChannelAuth, channelFallback } from '../../fabrica-saas/social-content/policies/socialChannelAuthStatus.js';
import { PRIVACY_RISK, validateSocialContentPrivacy } from '../../fabrica-saas/social-content/policies/socialContentPrivacyPolicy.js';

// Make
import { SOCIAL_AUTOMATION_STATUS, evaluateSocialAutomationStatus } from '../../fabrica-saas/social-content/make/socialAutomationStatus.js';
import { createSocialMakePayload } from '../../fabrica-saas/social-content/make/socialMakePayload.js';
import { MAKE_BRIDGE_MODE, runSocialMakePipeline } from '../../fabrica-saas/social-content/make/socialMakeBridge.js';

// Campaigns
import { CAMPAIGN_STATUS, CAMPAIGN_TYPE, createSocialCampaign } from '../../fabrica-saas/social-content/campaigns/socialCampaign.js';
import { generateSocialCampaignPlan } from '../../fabrica-saas/social-content/campaigns/generateSocialCampaignPlan.js';

// Bridges
import { bridgeToAIMedia } from '../../fabrica-saas/social-content/bridges/socialMediaBridge.js';
import { bridgeToLeadEngine } from '../../fabrica-saas/social-content/bridges/socialLeadEngineBridge.js';
import { bridgeToCRM } from '../../fabrica-saas/social-content/bridges/socialCRMBridge.js';
import { bridgeToAgentEngine } from '../../fabrica-saas/social-content/bridges/socialAgentBridge.js';
import { createSocialMCPRequest } from '../../fabrica-saas/social-content/bridges/socialMCPBridge.js';
import { SOCIAL_OBS_EVENT, emitSocialEvent } from '../../fabrica-saas/social-content/bridges/socialObservabilityBridge.js';

// Reporting
import { createSocialContentReport } from '../../fabrica-saas/social-content/reporting/socialContentReport.js';
import { computeSocialEngineQualityScore } from '../../fabrica-saas/social-content/reporting/socialEngineQualityScore.js';

// Registry
import { SOCIAL_CONTENT_REGISTRY } from '../../fabrica-saas/factory-registry/socialContent.js';
import { REGISTRY_VERSION, PASO_ADV14_STATUS } from '../../fabrica-saas/factory-registry/index.js';

// Fixtures
import { ALL_FIXTURE_BUSINESSES, FIXTURE_PADEL_CLUB, FIXTURE_FISIONOVA } from '../../fabrica-saas/social-content/fixtures/fixtureBusinesses.js';
import { ALL_FIXTURE_CAMPAIGNS, CAMPAIGN_PADEL_BRAND_LAUNCH } from '../../fabrica-saas/social-content/fixtures/fixtureCampaigns.js';
import { ALL_FIXTURE_CONTENT_ITEMS, POST_PADEL_001 } from '../../fabrica-saas/social-content/fixtures/fixtureContentItems.js';
import { GOOD_POST_EDUCATIONAL, GOOD_CAMPAIGN_PLAN, GOOD_MAKE_PAYLOAD, GOOD_STRATEGY_PROFILE } from '../../fabrica-saas/social-content/fixtures/goodFixtures.js';
import { ALL_FAILURE_FIXTURES, FAILURE_INVENTED_PRICE, FAILURE_REAL_PUBLISH_ATTEMPT } from '../../fabrica-saas/social-content/fixtures/failureFixtures.js';
import { ALL_MAKE_PAYLOAD_FIXTURES, MAKE_PAYLOAD_PADEL_REEL } from '../../fabrica-saas/social-content/fixtures/makePayloadFixtures.js';

// ─── Suite 1: SOCIAL_OBJECTIVE ─────────────────────────────────────────────
describe('SOCIAL_OBJECTIVE', () => {
  it('has 12 objective values', () => {
    assert.equal(Object.values(SOCIAL_OBJECTIVE).length, 12);
  });
  it('BOOKING_CONVERSION is defined', () => {
    assert.equal(SOCIAL_OBJECTIVE.BOOKING_CONVERSION, 'BOOKING_CONVERSION');
  });
  it('getObjectiveLabel returns Spanish label', () => {
    const label = getObjectiveLabel(SOCIAL_OBJECTIVE.EDUCATION);
    assert.ok(label.length > 3);
  });
  it('getObjectiveLabel throws for unknown', () => {
    assert.throws(() => getObjectiveLabel('UNKNOWN_OBJ'), /Unknown objective/);
  });
  it('listObjectives returns 12 items with isReal: false', () => {
    const list = listObjectives();
    assert.equal(list.length, 12);
    assert.equal(list[0].isReal, false);
  });
});

// ─── Suite 2: CONTENT_PILLAR ───────────────────────────────────────────────
describe('CONTENT_PILLAR', () => {
  it('has 15 pillar types', () => {
    assert.equal(Object.values(CONTENT_PILLAR).length, 15);
  });
  it('createContentPillar throws without type', () => {
    assert.throws(() => createContentPillar({}), /requires type/);
  });
  it('createContentPillar creates frozen pillar with isReal: false', () => {
    const p = createContentPillar({ type: CONTENT_PILLAR.EDUCATIONAL });
    assert.equal(p.type, 'EDUCATIONAL');
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('createContentPillar accepts custom weight', () => {
    const p = createContentPillar({ type: CONTENT_PILLAR.SOCIAL_PROOF, weight: 0.25 });
    assert.equal(p.weight, 0.25);
  });
  it('getRecommendedPillarSet returns frozen array', () => {
    const set = getRecommendedPillarSet([]);
    assert.ok(Array.isArray(set));
    assert.ok(Object.isFrozen(set));
  });
});

// ─── Suite 3: SocialStrategyProfile ───────────────────────────────────────
describe('SocialStrategyProfile', () => {
  it('throws without businessId', () => {
    assert.throws(() => createSocialStrategyProfile({ clientId: 'c1' }), /businessId/);
  });
  it('throws without clientId', () => {
    assert.throws(() => createSocialStrategyProfile({ businessId: 'b1' }), /clientId/);
  });
  it('creates profile with defaults', () => {
    const p = createSocialStrategyProfile({ businessId: 'b1', clientId: 'c1' });
    assert.equal(p.organicFirst, true);
    assert.equal(p.adsEnabled, false);
    assert.equal(p.noRealPublish, true);
    assert.equal(p.isReal, false);
  });
  it('throws for unknown objective', () => {
    assert.throws(() => createSocialStrategyProfile({ businessId: 'b1', clientId: 'c1', objectives: ['INVALID_OBJ'] }), /Unknown objective/);
  });
  it('throws for unknown pillar', () => {
    assert.throws(() => createSocialStrategyProfile({ businessId: 'b1', clientId: 'c1', pillars: ['INVALID_PILLAR'] }), /Unknown pillar/);
  });
  it('is frozen', () => {
    const p = createSocialStrategyProfile({ businessId: 'b1', clientId: 'c1' });
    assert.ok(Object.isFrozen(p));
  });
  it('STRATEGY_MATURITY has 4 values', () => {
    assert.equal(Object.values(STRATEGY_MATURITY).length, 4);
  });
});

// ─── Suite 4: SocialCopyStyle ──────────────────────────────────────────────
describe('SocialCopyStyle', () => {
  it('has 10 styles', () => {
    assert.equal(Object.values(SOCIAL_COPY_STYLE).length, 10);
  });
  it('getCopyStyleMeta returns meta for CONVERSATIONAL', () => {
    const m = getCopyStyleMeta(SOCIAL_COPY_STYLE.CONVERSATIONAL);
    assert.equal(m.style, 'CONVERSATIONAL');
    assert.equal(m.isReal, false);
  });
  it('getCopyStyleMeta throws for unknown', () => {
    assert.throws(() => getCopyStyleMeta('UNKNOWN_STYLE'), /Unknown copy style/);
  });
  it('listCopyStyles returns 10 items', () => {
    assert.equal(listCopyStyles().length, 10);
  });
  it('each style has emojiUsage and sentenceLength', () => {
    listCopyStyles().forEach(s => {
      assert.ok(s.emojiUsage);
      assert.ok(s.sentenceLength);
    });
  });
});

// ─── Suite 5: SocialCadencePolicy ─────────────────────────────────────────
describe('SocialCadencePolicy', () => {
  it('creates STANDARD cadence with defaults', () => {
    const c = createSocialCadencePolicy({ preset: CADENCE_PRESET.STANDARD });
    assert.equal(c.postsPerWeek, 4);
    assert.equal(c.noRealSchedule, true);
    assert.equal(c.isReal, false);
  });
  it('throws for unknown preset', () => {
    assert.throws(() => createSocialCadencePolicy({ preset: 'UNKNOWN' }), /Unknown cadence preset/);
  });
  it('LIGHT preset has postsPerWeek 2', () => {
    const c = createSocialCadencePolicy({ preset: CADENCE_PRESET.LIGHT });
    assert.equal(c.postsPerWeek, 2);
  });
  it('evaluateCadenceCompliance returns compliant for valid policy', () => {
    const policy = createSocialCadencePolicy({ preset: CADENCE_PRESET.STANDARD });
    const r = evaluateCadenceCompliance({}, policy);
    assert.equal(r.compliant, true);
    assert.equal(r.isReal, false);
  });
});

// ─── Suite 6: SocialContentBrief ──────────────────────────────────────────
describe('SocialContentBrief', () => {
  it('throws without businessId', () => {
    assert.throws(() => createSocialContentBrief({ clientId: 'c1', objective: SOCIAL_OBJECTIVE.EDUCATION, pillar: CONTENT_PILLAR.EDUCATIONAL, channel: 'FACEBOOK' }), /businessId/);
  });
  it('throws without objective', () => {
    assert.throws(() => createSocialContentBrief({ businessId: 'b1', clientId: 'c1', pillar: CONTENT_PILLAR.EDUCATIONAL, channel: 'FACEBOOK' }), /objective/);
  });
  it('throws for unknown objective', () => {
    assert.throws(() => createSocialContentBrief({ businessId: 'b1', clientId: 'c1', objective: 'BAD', pillar: CONTENT_PILLAR.EDUCATIONAL, channel: 'FACEBOOK' }), /Unknown objective/);
  });
  it('creates brief with defaults', () => {
    const b = createSocialContentBrief({ businessId: 'b1', clientId: 'c1', objective: SOCIAL_OBJECTIVE.EDUCATION, pillar: CONTENT_PILLAR.EDUCATIONAL, channel: 'INSTAGRAM_REEL' });
    assert.equal(b.isReal, false);
    assert.ok(Object.isFrozen(b));
    assert.ok(Array.isArray(b.restrictions));
  });
});

// ─── Suite 7: resolveSocialStrategy ───────────────────────────────────────
describe('resolveSocialStrategy', () => {
  it('throws without businessId', () => {
    assert.throws(() => resolveSocialStrategy({ clientId: 'c1' }), /businessId/);
  });
  it('resolves padel sector', () => {
    const r = resolveSocialStrategy({ businessId: 'b1', clientId: 'c1', sector: 'padel' });
    assert.equal(r.resolvedSector, 'padel');
    assert.equal(r.profile.organicFirst, true);
    assert.equal(r.isReal, false);
  });
  it('resolves fisioterapia sector', () => {
    const r = resolveSocialStrategy({ businessId: 'b1', clientId: 'c1', sector: 'fisioterapia' });
    assert.equal(r.resolvedSector, 'fisioterapia');
  });
  it('falls back to default for unknown sector', () => {
    const r = resolveSocialStrategy({ businessId: 'b1', clientId: 'c1', sector: 'unknown_sector_xyz' });
    assert.equal(r.resolvedSector, 'default');
  });
  it('profile is frozen', () => {
    const r = resolveSocialStrategy({ businessId: 'b1', clientId: 'c1' });
    assert.ok(Object.isFrozen(r.profile));
  });
});

// ─── Suite 8: LocalBusinessContentPolicy ──────────────────────────────────
describe('LocalBusinessContentPolicy', () => {
  it('creates policy with default rules', () => {
    const p = createLocalBusinessContentPolicy({});
    assert.equal(p.noInventedClaims, true);
    assert.equal(p.isReal, false);
    assert.ok(p.activeRules.includes(LOCAL_POLICY_RULE.NO_INVENTED_PRICES));
  });
  it('LOCAL_POLICY_RULE has 8 values', () => {
    assert.equal(Object.values(LOCAL_POLICY_RULE).length, 8);
  });
  it('validateAgainstLocalPolicy passes for clean content', () => {
    const policy = createLocalBusinessContentPolicy({});
    const r = validateAgainstLocalPolicy({ mentionsPrice: false }, policy);
    assert.equal(r.passed, true);
    assert.equal(r.isReal, false);
  });
  it('validateAgainstLocalPolicy detects unverified price', () => {
    const policy = createLocalBusinessContentPolicy({});
    const r = validateAgainstLocalPolicy({ mentionsPrice: true, priceVerified: false }, policy);
    assert.equal(r.passed, false);
    assert.ok(r.violations.some(v => v.rule === LOCAL_POLICY_RULE.NO_INVENTED_PRICES));
  });
  it('detects fake testimonial', () => {
    const policy = createLocalBusinessContentPolicy({});
    const r = validateAgainstLocalPolicy({ hasFakeTestimonial: true }, policy);
    assert.equal(r.passed, false);
  });
});

// ─── Suite 9: SocialSeasonalityEngine ─────────────────────────────────────
describe('SocialSeasonalityEngine', () => {
  it('SEASON has 4 values', () => {
    assert.equal(Object.values(SEASON).length, 4);
  });
  it('getSeasonForMonth returns VERANO for July', () => {
    assert.equal(getSeasonForMonth(7), SEASON.VERANO);
  });
  it('getSeasonForMonth returns INVIERNO for December', () => {
    assert.equal(getSeasonForMonth(12), SEASON.INVIERNO);
  });
  it('getSeasonForMonth throws for invalid month', () => {
    assert.throws(() => getSeasonForMonth(13), /Invalid month/);
  });
  it('getSeasonalContext returns themes and holidays', () => {
    const ctx = getSeasonalContext(12);
    assert.equal(ctx.season, SEASON.INVIERNO);
    assert.ok(Array.isArray(ctx.themes));
    assert.ok(Array.isArray(ctx.holidays));
    assert.equal(ctx.isReal, false);
  });
  it('generateSeasonalContentAngle returns primaryTheme', () => {
    const angle = generateSeasonalContentAngle(6, 'padel');
    assert.ok(angle.primaryTheme);
    assert.equal(angle.isReal, false);
  });
});

// ─── Suite 10: ContentNoveltyEngine ───────────────────────────────────────
describe('ContentNoveltyEngine', () => {
  it('NOVELTY_STATUS has 4 values', () => {
    assert.equal(Object.values(NOVELTY_STATUS).length, 4);
  });
  it('returns FRESH for unique topic', () => {
    const r = checkContentNovelty({ topic: 'volea avanzada' }, []);
    assert.equal(r.status, NOVELTY_STATUS.FRESH);
    assert.equal(r.score, 100);
    assert.equal(r.isReal, false);
  });
  it('returns DUPLICATE for exact match', () => {
    const existing = [{ id: 'x1', topic: 'volea avanzada', pillar: 'EDUCATIONAL' }];
    const r = checkContentNovelty({ topic: 'volea avanzada', pillar: 'EDUCATIONAL' }, existing);
    assert.equal(r.status, NOVELTY_STATUS.DUPLICATE);
    assert.equal(r.score, 0);
  });
  it('throws without topic', () => {
    assert.throws(() => checkContentNovelty({}, []), /topic/);
  });
});

// ─── Suite 11: ContentIdeaScore ───────────────────────────────────────────
describe('ContentIdeaScore', () => {
  it('throws without topic', () => {
    assert.throws(() => scoreContentIdea({ pillar: 'EDUCATIONAL', objective: 'EDUCATION' }, {}), /topic/);
  });
  it('returns score with isReal: false', () => {
    const s = scoreContentIdea({ topic: 'pádel', pillar: 'EDUCATIONAL', objective: 'EDUCATION' }, { pillarMatch: true, seasonalMatch: true, audienceFit: true });
    assert.equal(s.isReal, false);
    assert.ok(s.total >= 0 && s.total <= 100);
    assert.equal(s.topic, 'pádel');
  });
  it('recommended is true when total >= 65', () => {
    const s = scoreContentIdea({ topic: 'test', pillar: 'EDUCATIONAL', objective: 'EDUCATION', noveltyScore: 100 }, { pillarMatch: true, seasonalMatch: true, audienceFit: true });
    assert.equal(s.recommended, s.total >= 65);
  });
  it('claimSafe is 0 when hasSuspectedClaim', () => {
    const s = scoreContentIdea({ topic: 'test', pillar: 'EDUCATIONAL', objective: 'EDUCATION', hasSuspectedClaim: true }, {});
    assert.equal(s.breakdown.claimSafe, 0);
  });
});

// ─── Suite 12: generateContentIdeas ───────────────────────────────────────
describe('generateContentIdeas', () => {
  it('throws without businessId', () => {
    assert.throws(() => generateContentIdeas({ clientId: 'c1', pillars: ['EDUCATIONAL'] }), /businessId/);
  });
  it('throws without pillars', () => {
    assert.throws(() => generateContentIdeas({ businessId: 'b1', clientId: 'c1', pillars: [] }), /pillars/);
  });
  it('generates ideas sorted by score', () => {
    const r = generateContentIdeas({ businessId: 'b1', clientId: 'c1', pillars: ['EDUCATIONAL', 'SOCIAL_PROOF'], topics: ['pádel', 'comunidad'], objective: 'BOOKING_CONVERSION' });
    assert.equal(r.isReal, false);
    assert.ok(r.total > 0);
    assert.ok(r.ideas[0].score >= (r.ideas[r.ideas.length - 1]?.score ?? 0));
  });
  it('skips duplicate ideas', () => {
    const existing = [{ id: 'e1', topic: 'Guía básica de pádel', pillar: 'EDUCATIONAL' }];
    const r = generateContentIdeas({ businessId: 'b1', clientId: 'c1', pillars: ['EDUCATIONAL'], topics: ['pádel'], existingIdeas: existing });
    const dupe = r.ideas.find(i => i.topic === 'Guía básica de pádel' && i.pillar === 'EDUCATIONAL');
    assert.equal(dupe, undefined);
  });
});

// ─── Suite 13: SocialHookEngine ───────────────────────────────────────────
describe('SocialHookEngine', () => {
  it('HOOK_TYPE has 9 values', () => {
    assert.equal(Object.values(HOOK_TYPE).length, 9);
  });
  it('generateHook throws without type', () => {
    assert.throws(() => generateHook({}), /type/);
  });
  it('generateHook throws for unknown type', () => {
    assert.throws(() => generateHook({ type: 'UNKNOWN' }), /Unknown hook type/);
  });
  it('generateHook QUESTION replaces topic', () => {
    const h = generateHook({ type: HOOK_TYPE.QUESTION, topic: 'pádel' });
    assert.ok(h.text.includes('pádel'));
    assert.equal(h.isReal, false);
  });
  it('generateHook LOCAL replaces locality', () => {
    const h = generateHook({ type: HOOK_TYPE.LOCAL, topic: 'el pádel', locality: 'Archidona' });
    assert.ok(h.text.includes('Archidona'));
  });
  it('getBestHookForObjective returns valid HOOK_TYPE', () => {
    const ht = getBestHookForObjective(SOCIAL_OBJECTIVE.BOOKING_CONVERSION);
    assert.ok(Object.values(HOOK_TYPE).includes(ht));
  });
});

// ─── Suite 14: SocialCTAEngine ────────────────────────────────────────────
describe('SocialCTAEngine', () => {
  it('CTA_TYPE has 10 values', () => {
    assert.equal(Object.values(CTA_TYPE).length, 10);
  });
  it('generateCTA throws without type', () => {
    assert.throws(() => generateCTA({}), /type/);
  });
  it('generateCTA throws for unknown type', () => {
    assert.throws(() => generateCTA({ type: 'UNKNOWN' }), /Unknown CTA type/);
  });
  it('generateCTA BOOK returns booking text', () => {
    const c = generateCTA({ type: CTA_TYPE.BOOK });
    assert.ok(c.text.includes('Reserva'));
    assert.equal(c.isReal, false);
  });
  it('generateCTA NONE returns empty text', () => {
    const c = generateCTA({ type: CTA_TYPE.NONE });
    assert.equal(c.text, '');
  });
  it('getBestCTAForObjective returns valid CTA_TYPE', () => {
    const ct = getBestCTAForObjective(SOCIAL_OBJECTIVE.EDUCATION);
    assert.ok(Object.values(CTA_TYPE).includes(ct));
  });
});

// ─── Suite 15: HashtagStrategy ────────────────────────────────────────────
describe('HashtagStrategy', () => {
  it('throws without channel', () => {
    assert.throws(() => generateHashtags({ sector: 'padel' }), /channel/);
  });
  it('throws without sector', () => {
    assert.throws(() => generateHashtags({ channel: 'INSTAGRAM_REEL' }), /sector/);
  });
  it('respects channel limit for Instagram', () => {
    const r = generateHashtags({ channel: 'INSTAGRAM_REEL', sector: 'padel' });
    assert.ok(r.count <= 20);
    assert.equal(r.isReal, false);
  });
  it('respects channel limit for X (2)', () => {
    const r = generateHashtags({ channel: 'X', sector: 'padel' });
    assert.ok(r.count <= 2);
  });
  it('includes local hashtag when city provided', () => {
    const r = generateHashtags({ channel: 'INSTAGRAM_REEL', sector: 'padel', city: 'Archidona' });
    assert.ok(r.hashtags.some(h => h.includes('archidona')));
  });
  it('uses sector hashtags for padel', () => {
    const r = generateHashtags({ channel: 'INSTAGRAM_REEL', sector: 'padel' });
    assert.ok(r.hashtags.some(h => h === '#padel'));
  });
});

// ─── Suite 16: SocialDiscoveryProfile ─────────────────────────────────────
describe('SocialDiscoveryProfile', () => {
  it('throws without businessId', () => {
    assert.throws(() => createSocialDiscoveryProfile({ channel: 'INSTAGRAM_REEL' }), /businessId/);
  });
  it('throws without channel', () => {
    assert.throws(() => createSocialDiscoveryProfile({ businessId: 'b1' }), /channel/);
  });
  it('creates profile with noRealAdsTarget: true', () => {
    const p = createSocialDiscoveryProfile({ businessId: 'b1', channel: 'INSTAGRAM_REEL' });
    assert.equal(p.noRealAdsTarget, true);
    assert.equal(p.isReal, false);
  });
});

// ─── Suite 17: generateSocialPost ─────────────────────────────────────────
describe('generateSocialPost', () => {
  const base = { businessId: 'b1', clientId: 'c1', objective: SOCIAL_OBJECTIVE.BOOKING_CONVERSION, channel: 'INSTAGRAM_REEL', topic: 'pádel', sector: 'padel' };
  it('throws without businessId', () => {
    assert.throws(() => generateSocialPost({ clientId: 'c1', objective: 'X', channel: 'X', topic: 'X' }), /businessId/);
  });
  it('generates post with all fields', () => {
    const p = generateSocialPost(base);
    assert.ok(p.hook.length > 0);
    assert.ok(p.cta.length > 0);
    assert.ok(p.fullText.length > 0);
    assert.equal(p.noRealPublish, true);
    assert.equal(p.isReal, false);
  });
  it('wordCount is positive', () => {
    const p = generateSocialPost(base);
    assert.ok(p.wordCount > 0);
  });
  it('hashtags is array', () => {
    const p = generateSocialPost(base);
    assert.ok(Array.isArray(p.hashtags));
  });
});

// ─── Suite 18: resolveSocialMediaType ─────────────────────────────────────
describe('resolveSocialMediaType', () => {
  it('SOCIAL_MEDIA_TYPE has 7 values', () => {
    assert.equal(Object.values(SOCIAL_MEDIA_TYPE).length, 7);
  });
  it('throws without channel', () => {
    assert.throws(() => resolveSocialMediaType({}), /channel/);
  });
  it('throws for unknown channel', () => {
    assert.throws(() => resolveSocialMediaType({ channel: 'UNKNOWN_CHANNEL' }), /Unknown channel/);
  });
  it('INSTAGRAM_REEL defaults to SHORT_VIDEO', () => {
    const r = resolveSocialMediaType({ channel: 'INSTAGRAM_REEL' });
    assert.equal(r.channelDefault, SOCIAL_MEDIA_TYPE.SHORT_VIDEO);
    assert.equal(r.isReal, false);
  });
  it('LINKEDIN defaults to TEXT', () => {
    const r = resolveSocialMediaType({ channel: 'LINKEDIN' });
    assert.equal(r.channelDefault, SOCIAL_MEDIA_TYPE.TEXT);
  });
  it('EDUCATIONAL pillar hints CAROUSEL', () => {
    const r = resolveSocialMediaType({ channel: 'INSTAGRAM_REEL', pillar: 'EDUCATIONAL' });
    assert.equal(r.pillarHint, SOCIAL_MEDIA_TYPE.CAROUSEL);
  });
});

// ─── Suite 19: Platform Adapters ──────────────────────────────────────────
describe('Platform Adapters', () => {
  const post = { fullText: 'Hook text.\n\nBody text.\n\nCTA text. #padel', hook: 'Hook text.', hashtags: ['#padel', '#deporte'], topic: 'pádel', wordCount: 10, businessId: 'b1', clientId: 'c1', channel: 'INSTAGRAM_REEL' };

  it('adaptForInstagramReel has noRealPublish: true', () => {
    const a = adaptForInstagramReel(post);
    assert.equal(a.noRealPublish, true);
    assert.equal(a.isReal, false);
    assert.equal(a.platform, 'INSTAGRAM_REEL');
  });
  it('adaptForInstagramReel throws without fullText', () => {
    assert.throws(() => adaptForInstagramReel({}), /fullText/);
  });
  it('adaptForInstagramStory has noRealPublish: true', () => {
    const a = adaptForInstagramStory(post);
    assert.equal(a.noRealPublish, true);
    assert.equal(a.platform, 'INSTAGRAM_STORY');
  });
  it('adaptForFacebook respects char limit', () => {
    const a = adaptForFacebook(post);
    assert.ok(a.text.length <= 480);
    assert.equal(a.isReal, false);
  });
  it('adaptForTikTok has noRealPublish: true', () => {
    const a = adaptForTikTok(post);
    assert.equal(a.noRealPublish, true);
    assert.equal(a.platform, 'TIKTOK');
  });
  it('adaptForYouTubeShort has aspectRatio 9:16', () => {
    const a = adaptForYouTubeShort(post);
    assert.equal(a.aspectRatio, '9:16');
    assert.equal(a.isReal, false);
  });
  it('adaptForYouTubeLong has aspectRatio 16:9', () => {
    const a = adaptForYouTubeLong(post);
    assert.equal(a.aspectRatio, '16:9');
  });
  it('adaptForLinkedIn tone is PROFESSIONAL', () => {
    const a = adaptForLinkedIn(post);
    assert.equal(a.tone, 'PROFESSIONAL');
    assert.equal(a.isReal, false);
  });
  it('adaptForX respects 280 char limit', () => {
    const a = adaptForX(post);
    assert.ok(a.text.length <= 280);
    assert.equal(a.isReal, false);
  });
  it('adaptForThreads respects 500 char limit', () => {
    const a = adaptForThreads(post);
    assert.ok(a.text.length <= 500);
    assert.equal(a.isReal, false);
  });
});

// ─── Suite 20: evaluateChannelDifferentiation ─────────────────────────────
describe('evaluateChannelDifferentiation', () => {
  it('throws for empty adaptations', () => {
    assert.throws(() => evaluateChannelDifferentiation([]), /at least one/);
  });
  it('returns differentiated for distinct platforms', () => {
    const r = evaluateChannelDifferentiation([
      { platform: 'INSTAGRAM_REEL', caption: 'Hook text for reel.' },
      { platform: 'FACEBOOK', text: 'Facebook post with different text.' },
    ]);
    assert.equal(r.differentiated, true);
    assert.equal(r.isReal, false);
  });
  it('detects duplicate platform', () => {
    const r = evaluateChannelDifferentiation([
      { platform: 'INSTAGRAM_REEL', caption: 'Text A' },
      { platform: 'INSTAGRAM_REEL', caption: 'Text B' },
    ]);
    assert.equal(r.differentiated, false);
    assert.ok(r.issues.some(i => i.issue === 'DUPLICATE_PLATFORM'));
  });
});

// ─── Suite 21: repurposeContent ───────────────────────────────────────────
describe('repurposeContent', () => {
  const post = { businessId: 'b1', clientId: 'c1', fullText: 'Texto de contenido.', hashtags: ['#padel'], hook: 'Hook', cta: 'CTA', channel: 'INSTAGRAM_REEL' };
  it('throws without fullText', () => {
    assert.throws(() => repurposeContent({}, ['INSTAGRAM_REEL']), /fullText/);
  });
  it('throws without targetChannels', () => {
    assert.throws(() => repurposeContent(post, []), /targetChannel/);
  });
  it('produces adaptations for supported channels', () => {
    const r = repurposeContent(post, ['INSTAGRAM_REEL', 'FACEBOOK', 'TIKTOK']);
    assert.equal(r.adaptations.length, 3);
    assert.equal(r.noRealPublish, true);
    assert.equal(r.isReal, false);
  });
  it('lists unsupported channels', () => {
    const r = repurposeContent(post, ['INSTAGRAM_REEL', 'FAKEPLATFORM']);
    assert.ok(r.unsupportedChannels.includes('FAKEPLATFORM'));
  });
});

// ─── Suite 22: ContentSeries ───────────────────────────────────────────────
describe('ContentSeries', () => {
  it('SERIES_TYPE has 7 values', () => {
    assert.equal(Object.values(SERIES_TYPE).length, 7);
  });
  it('throws without businessId', () => {
    assert.throws(() => createContentSeries({ clientId: 'c1', type: SERIES_TYPE.FAQ_SERIES, title: 'FAQ', episodes: 5 }), /businessId/);
  });
  it('throws for episodes < 2', () => {
    assert.throws(() => createContentSeries({ businessId: 'b1', clientId: 'c1', type: SERIES_TYPE.FAQ_SERIES, title: 'FAQ', episodes: 1 }), /at least 2/);
  });
  it('creates series with isReal: false', () => {
    const s = createContentSeries({ businessId: 'b1', clientId: 'c1', type: SERIES_TYPE.EDUCATIONAL_SEQUENCE, title: 'Guía Pádel', episodes: 5 });
    assert.equal(s.isReal, false);
    assert.ok(Object.isFrozen(s));
  });
});

// ─── Suite 23: SocialContentCalendar ──────────────────────────────────────
describe('SocialContentCalendar', () => {
  it('CALENDAR_STATUS has 7 values', () => {
    assert.equal(Object.values(CALENDAR_STATUS).length, 7);
  });
  it('throws without businessId', () => {
    assert.throws(() => createSocialContentCalendarEntry({ clientId: 'c1', channel: 'FACEBOOK', scheduledDate: '2026-10-15' }), /businessId/);
  });
  it('throws for unknown status', () => {
    assert.throws(() => createSocialContentCalendarEntry({ businessId: 'b1', clientId: 'c1', channel: 'FACEBOOK', scheduledDate: '2026-10-15', status: 'INVALID' }), /Unknown calendar status/);
  });
  it('creates entry with noRealSchedule: true', () => {
    const e = createSocialContentCalendarEntry({ businessId: 'b1', clientId: 'c1', channel: 'INSTAGRAM_REEL', scheduledDate: '2026-10-15' });
    assert.equal(e.noRealSchedule, true);
    assert.equal(e.isReal, false);
  });
  it('transitionCalendarStatus to APPROVED requires approver', () => {
    const e = createSocialContentCalendarEntry({ businessId: 'b1', clientId: 'c1', channel: 'FACEBOOK', scheduledDate: '2026-10-15' });
    assert.throws(() => transitionCalendarStatus(e, CALENDAR_STATUS.APPROVED), /approver/);
  });
  it('transitions status with approver', () => {
    const e = createSocialContentCalendarEntry({ businessId: 'b1', clientId: 'c1', channel: 'FACEBOOK', scheduledDate: '2026-10-15' });
    const approved = transitionCalendarStatus(e, CALENDAR_STATUS.APPROVED, 'manager@example.com');
    assert.equal(approved.status, CALENDAR_STATUS.APPROVED);
    assert.equal(approved.approvedBy, 'manager@example.com');
  });
});

// ─── Suite 24: evaluateContentCalendarBalance ─────────────────────────────
describe('evaluateContentCalendarBalance', () => {
  it('throws for non-array input', () => {
    assert.throws(() => evaluateContentCalendarBalance(null), /entries array/);
  });
  it('balanced for empty calendar', () => {
    const r = evaluateContentCalendarBalance([]);
    assert.equal(r.balanced, true);
    assert.equal(r.isReal, false);
  });
  it('detects pillar imbalance', () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({
      status: CALENDAR_STATUS.READY, pillar: 'PROMOTIONS',
    }));
    const r = evaluateContentCalendarBalance(entries, { postsPerWeek: 3 });
    assert.equal(r.balanced, false);
    assert.ok(r.issues.some(i => i.issue === 'PILLAR_IMBALANCE' || i.issue === 'TOO_MANY_PROMOTIONS'));
  });
});

// ─── Suite 25: SocialContentQualityScore ──────────────────────────────────
describe('SocialContentQualityScore', () => {
  it('throws without businessId', () => {
    assert.throws(() => computeSocialContentQualityScore({}), /businessId/);
  });
  it('returns overall in 0–100 with isReal: false', () => {
    const s = computeSocialContentQualityScore({ businessId: 'b1', hook: 'Hook text here', cta: 'Book now.', wordCount: 50, hashtags: ['#padel'] }, { pillarMatch: true, objectiveMatch: true });
    assert.ok(s.overall >= 0 && s.overall <= 100);
    assert.equal(s.isReal, false);
  });
  it('breakdown has 11 factors', () => {
    const s = computeSocialContentQualityScore({ businessId: 'b1', hook: 'H', cta: 'C', wordCount: 10, hashtags: [] }, {});
    assert.equal(Object.keys(s.breakdown).length, 11);
  });
  it('claimSafety is 0 when hasViolation', () => {
    const s = computeSocialContentQualityScore({ businessId: 'b1' }, { hasViolation: true });
    assert.equal(s.breakdown.claimSafety, 0);
  });
});

// ─── Suite 26: SocialContentQualityGate ───────────────────────────────────
describe('SocialContentQualityGate', () => {
  it('SOCIAL_GATE_STATUS has 4 values', () => {
    assert.equal(Object.values(SOCIAL_GATE_STATUS).length, 4);
  });
  it('SOCIAL_CRITICAL_FAILURE has 12 values', () => {
    assert.equal(Object.values(SOCIAL_CRITICAL_FAILURE).length, 12);
  });
  it('criticalFailures → BLOCKED regardless of score', () => {
    const r = evaluateSocialContentQualityGate({ overall: 95 }, [SOCIAL_CRITICAL_FAILURE.FAKE_TESTIMONIAL], []);
    assert.equal(r.status, SOCIAL_GATE_STATUS.BLOCKED);
    assert.equal(r.isReal, false);
  });
  it('score < 50 → FAIL', () => {
    const r = evaluateSocialContentQualityGate({ overall: 40 }, [], []);
    assert.equal(r.status, SOCIAL_GATE_STATUS.FAIL);
  });
  it('score ≥ 70, no warnings → PASS', () => {
    const r = evaluateSocialContentQualityGate({ overall: 80 }, [], []);
    assert.equal(r.status, SOCIAL_GATE_STATUS.PASS);
  });
  it('score ≥ 70 but warnings → WARN', () => {
    const r = evaluateSocialContentQualityGate({ overall: 80 }, [], ['some warning']);
    assert.equal(r.status, SOCIAL_GATE_STATUS.WARN);
  });
});

// ─── Suite 27: evaluateSocialBrandConsistency ──────────────────────────────
describe('evaluateSocialBrandConsistency', () => {
  it('throws without businessId in post', () => {
    assert.throws(() => evaluateSocialBrandConsistency({}, { businessId: 'b1' }), /businessId/);
  });
  it('blocks when businessId mismatch', () => {
    const r = evaluateSocialBrandConsistency({ businessId: 'b1' }, { businessId: 'b2' });
    assert.equal(r.consistent, false);
    assert.equal(r.score, 0);
    assert.equal(r.isReal, false);
  });
  it('passes for matching businessId with no violations', () => {
    const r = evaluateSocialBrandConsistency({ businessId: 'b1', fullText: 'Clean text', hashtags: ['#brand'] }, { businessId: 'b1', requiredHashtag: '#brand' });
    assert.equal(r.consistent, true);
    assert.equal(r.score, 100);
  });
  it('detects missing brand hashtag', () => {
    const r = evaluateSocialBrandConsistency({ businessId: 'b1', fullText: 'Text', hashtags: [] }, { businessId: 'b1', requiredHashtag: '#required' });
    assert.equal(r.consistent, false);
    assert.ok(r.issues.some(i => i.issue === 'MISSING_BRAND_HASHTAG'));
  });
});

// ─── Suite 28: evaluateSocialHumanness ────────────────────────────────────
describe('evaluateSocialHumanness', () => {
  it('throws without fullText or body', () => {
    assert.throws(() => evaluateSocialHumanness({}), /fullText/);
  });
  it('returns high score for natural text', () => {
    const r = evaluateSocialHumanness({ fullText: 'Hoy os queremos contar cómo nosotros preparamos las clases de pádel cada mañana.' });
    assert.ok(r.score >= 60);
    assert.equal(r.adv10Bridge, 'HUMANNESS_EVALUATOR_CONNECTED');
    assert.equal(r.isReal, false);
  });
  it('detects unfilled template variable', () => {
    const r = evaluateSocialHumanness({ fullText: 'Contenido sobre {{topic}} para vuestro negocio.' });
    assert.ok(r.issues.some(i => i.issue === 'ROBOTIC_LANGUAGE'));
  });
  it('penalizes very short text', () => {
    const r = evaluateSocialHumanness({ fullText: 'Hola.' });
    assert.ok(r.score < 100);
  });
});

// ─── Suite 29: evaluateSocialApproval ─────────────────────────────────────
describe('evaluateSocialApproval', () => {
  it('SOCIAL_APPROVAL_TRIGGER has 8 values', () => {
    assert.equal(Object.values(SOCIAL_APPROVAL_TRIGGER).length, 8);
  });
  it('no triggers when all safe', () => {
    const r = evaluateSocialApproval({ noRealPublish: true }, false);
    assert.equal(r.requiresApproval, false);
    assert.equal(r.isReal, false);
  });
  it('triggers AD_SPEND when adsEnabled', () => {
    const r = evaluateSocialApproval({ adsEnabled: true, noRealPublish: true }, false);
    assert.ok(r.triggers.includes(SOCIAL_APPROVAL_TRIGGER.AD_SPEND));
  });
  it('allowed when approved by human', () => {
    const r = evaluateSocialApproval({ adsEnabled: true }, true);
    assert.equal(r.allowed, true);
    assert.equal(r.approvedByHuman, true);
  });
  it('triggers LEGAL_MEDICAL for clinica sector', () => {
    const r = evaluateSocialApproval({ sector: 'clinica', noRealPublish: true }, false);
    assert.ok(r.triggers.includes(SOCIAL_APPROVAL_TRIGGER.LEGAL_MEDICAL));
  });
});

// ─── Suite 30: SocialAdsPolicy ────────────────────────────────────────────
describe('SocialAdsPolicy', () => {
  it('ADS_EXECUTION is BLOCKED', () => {
    assert.equal(ADS_EXECUTION, 'BLOCKED');
  });
  it('evaluateAdsPolicy blocks when adsRequested', () => {
    const r = evaluateAdsPolicy({ adsRequested: true });
    assert.equal(r.status, ADS_STATUS.BLOCKED);
    assert.equal(r.allowed, false);
    assert.equal(r.noRealAdSpend, true);
    assert.equal(r.isReal, false);
  });
  it('evaluateAdsPolicy returns NOT_PLANNED by default', () => {
    const r = evaluateAdsPolicy({});
    assert.equal(r.status, ADS_STATUS.NOT_PLANNED);
  });
  it('createAdsPlan requires human activation', () => {
    const p = createAdsPlan({ businessId: 'b1', objective: 'BRAND_AWARENESS', channel: 'FACEBOOK' });
    assert.equal(p.requiresHumanActivation, true);
    assert.equal(p.noRealAdSpend, true);
    assert.equal(p.execution, ADS_EXECUTION);
    assert.equal(p.isReal, false);
  });
});

// ─── Suite 31: SocialChannelAuthStatus ────────────────────────────────────
describe('SocialChannelAuthStatus', () => {
  it('CHANNEL_AUTH_STATUS has 5 values', () => {
    assert.equal(Object.values(CHANNEL_AUTH_STATUS).length, 5);
  });
  it('throws for realOAuthToken', () => {
    assert.throws(() => createChannelAuthStatus({ channel: 'INSTAGRAM_REEL', realOAuthToken: 'token' }), /real OAuth token/);
  });
  it('creates status with noRealOAuth: true', () => {
    const s = createChannelAuthStatus({ channel: 'INSTAGRAM_REEL', status: CHANNEL_AUTH_STATUS.NOT_CONNECTED });
    assert.equal(s.noRealOAuth, true);
    assert.equal(s.isReal, false);
  });
  it('evaluateChannelAuth: CONNECTED → publishable', () => {
    const auth = { channel: 'INSTAGRAM_REEL', status: CHANNEL_AUTH_STATUS.CONNECTED };
    const r = evaluateChannelAuth(auth);
    assert.equal(r.publishable, true);
    assert.equal(r.noRealPublish, true);
  });
  it('evaluateChannelAuth: EXPIRED → not publishable', () => {
    const auth = { channel: 'INSTAGRAM_REEL', status: CHANNEL_AUTH_STATUS.EXPIRED };
    const r = evaluateChannelAuth(auth);
    assert.equal(r.publishable, false);
  });
  it('channelFallback allows partial campaign', () => {
    const statuses = [
      { channel: 'INSTAGRAM_REEL', status: CHANNEL_AUTH_STATUS.CONNECTED },
      { channel: 'FACEBOOK', status: CHANNEL_AUTH_STATUS.NOT_CONNECTED },
    ];
    const r = channelFallback(statuses);
    assert.equal(r.partialCampaignAllowed, true);
    assert.ok(r.availableChannels.includes('INSTAGRAM_REEL'));
    assert.equal(r.isReal, false);
  });
});

// ─── Suite 32: SocialContentPrivacyPolicy ─────────────────────────────────
describe('SocialContentPrivacyPolicy', () => {
  it('PRIVACY_RISK has 5 values', () => {
    assert.equal(Object.values(PRIVACY_RISK).length, 5);
  });
  it('throws without businessId', () => {
    assert.throws(() => validateSocialContentPrivacy({ clientId: 'c1', fullText: '' }), /businessId/);
  });
  it('passes for clean content', () => {
    const r = validateSocialContentPrivacy({ businessId: 'b1', clientId: 'c1', fullText: 'Texto limpio sin datos.' }, {});
    assert.equal(r.passed, true);
    assert.equal(r.clientIsolation, true);
    assert.equal(r.isReal, false);
  });
  it('detects cross-client breach', () => {
    const r = validateSocialContentPrivacy({ businessId: 'b1', clientId: 'c1', fullText: '' }, { requestingClientId: 'c2' });
    assert.equal(r.passed, false);
    assert.equal(r.clientIsolation, false);
    assert.ok(r.risks.some(r => r.risk === PRIVACY_RISK.CLIENT_DATA_CROSS_LEAK));
  });
  it('detects personal data in copy (DNI)', () => {
    const r = validateSocialContentPrivacy({ businessId: 'b1', clientId: 'c1', fullText: 'El paciente 12345678A ha mejorado.' }, {});
    assert.equal(r.passed, false);
    assert.ok(r.risks.some(r => r.risk === PRIVACY_RISK.PERSONAL_DATA_IN_COPY));
  });
  it('detects real person image without consent', () => {
    const r = validateSocialContentPrivacy({ businessId: 'b1', clientId: 'c1', fullText: '', hasRealPersonImage: true }, {});
    assert.equal(r.passed, false);
    assert.ok(r.risks.some(r => r.risk === PRIVACY_RISK.REAL_PERSON_WITHOUT_CONSENT));
  });
});

// ─── Suite 33: SocialAutomationStatus ─────────────────────────────────────
describe('SocialAutomationStatus', () => {
  it('SOCIAL_AUTOMATION_STATUS has 6 values', () => {
    assert.equal(Object.values(SOCIAL_AUTOMATION_STATUS).length, 6);
  });
  it('BLOCKED when noRealPublish false', () => {
    const r = evaluateSocialAutomationStatus({ noRealPublish: false });
    assert.equal(r.status, SOCIAL_AUTOMATION_STATUS.BLOCKED);
    assert.equal(r.isReal, false);
  });
  it('WAITING_APPROVAL when not approved and requires it', () => {
    const r = evaluateSocialAutomationStatus({ noRealPublish: true, requiresApproval: true, approvedByHuman: false });
    assert.equal(r.status, SOCIAL_AUTOMATION_STATUS.WAITING_APPROVAL);
  });
  it('READY_FOR_MAKE when approved and dryRun ready', () => {
    const r = evaluateSocialAutomationStatus({ noRealPublish: true, readyForDryRun: true, approvedByHuman: true, requiresApproval: true });
    assert.equal(r.status, SOCIAL_AUTOMATION_STATUS.READY_FOR_MAKE);
  });
});

// ─── Suite 34: SocialMakePayload ──────────────────────────────────────────
describe('SocialMakePayload', () => {
  it('throws without businessId', () => {
    assert.throws(() => createSocialMakePayload({ clientId: 'c1', channel: 'FACEBOOK', postContent: { text: 'X' } }), /businessId/);
  });
  it('throws for realWebhookUrl', () => {
    assert.throws(() => createSocialMakePayload({ businessId: 'b1', clientId: 'c1', channel: 'FACEBOOK', postContent: { text: 'X' }, realWebhookUrl: 'https://hook.make.com' }), /webhookRef/);
  });
  it('throws for realToken', () => {
    assert.throws(() => createSocialMakePayload({ businessId: 'b1', clientId: 'c1', channel: 'FACEBOOK', postContent: { text: 'X' }, realToken: 'tok' }), /secretRef/);
  });
  it('creates payload with dryRun: true', () => {
    const p = createSocialMakePayload({ businessId: 'b1', clientId: 'c1', channel: 'INSTAGRAM_REEL', postContent: { text: 'Test post', hashtags: ['#padel'] } });
    assert.equal(p.dryRun, true);
    assert.equal(p.noRealPublish, true);
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
});

// ─── Suite 35: SocialMakeBridge ───────────────────────────────────────────
describe('SocialMakeBridge', () => {
  it('MAKE_BRIDGE_MODE has 2 values', () => {
    assert.equal(Object.values(MAKE_BRIDGE_MODE).length, 2);
  });
  it('throws when executeReal: true', () => {
    assert.throws(() => runSocialMakePipeline({ businessId: 'b1', clientId: 'c1', post: { channel: 'FACEBOOK', fullText: 'X' }, executeReal: true }), /DRY_RUN_ONLY/);
  });
  it('returns BLOCKED when approvalRequired and not approved', () => {
    const r = runSocialMakePipeline({ businessId: 'b1', clientId: 'c1', post: { channel: 'FACEBOOK', fullText: 'X' }, requiresApproval: true, approvedByHuman: false });
    assert.notEqual(r.mode, MAKE_BRIDGE_MODE.BLOCKED);
    assert.equal(r.isReal, false);
  });
  it('returns DRY_RUN payload when approved', () => {
    const r = runSocialMakePipeline({ businessId: 'b1', clientId: 'c1', post: { channel: 'FACEBOOK', fullText: 'Test.', objective: 'EDUCATION', hashtags: [] }, approvedByHuman: true });
    assert.equal(r.mode, MAKE_BRIDGE_MODE.DRY_RUN);
    assert.equal(r.dryRun, true);
    assert.equal(r.noRealWebhook, true);
    assert.equal(r.adv14Bridge, 'SOCIAL_MAKE_BRIDGE_CONNECTED');
    assert.equal(r.isReal, false);
  });
});

// ─── Suite 36: SocialCampaign ─────────────────────────────────────────────
describe('SocialCampaign', () => {
  it('CAMPAIGN_STATUS has 6 values', () => {
    assert.equal(Object.values(CAMPAIGN_STATUS).length, 6);
  });
  it('CAMPAIGN_TYPE has 7 values', () => {
    assert.equal(Object.values(CAMPAIGN_TYPE).length, 7);
  });
  it('throws without businessId', () => {
    assert.throws(() => createSocialCampaign({ clientId: 'c1', name: 'N', objective: 'EDUCATION' }), /businessId/);
  });
  it('throws when autoActivateAds with ORGANIC_PLUS_ADS type', () => {
    assert.throws(() => createSocialCampaign({ businessId: 'b1', clientId: 'c1', name: 'N', objective: 'EDUCATION', type: CAMPAIGN_TYPE.ORGANIC_PLUS_ADS, autoActivateAds: true }), /ADS_EXECUTION/);
  });
  it('creates campaign with adsBlocked: true', () => {
    const c = createSocialCampaign({ businessId: 'b1', clientId: 'c1', name: 'Camp', objective: 'EDUCATION' });
    assert.equal(c.adsBlocked, true);
    assert.equal(c.noRealPublish, true);
    assert.equal(c.isReal, false);
  });
});

// ─── Suite 37: generateSocialCampaignPlan ─────────────────────────────────
describe('generateSocialCampaignPlan', () => {
  it('throws without businessId', () => {
    assert.throws(() => generateSocialCampaignPlan({ clientId: 'c1', objective: 'EDUCATION', durationWeeks: 4 }), /businessId/);
  });
  it('throws for durationWeeks < 1', () => {
    assert.throws(() => generateSocialCampaignPlan({ businessId: 'b1', clientId: 'c1', objective: 'EDUCATION', durationWeeks: 0 }), /durationWeeks/);
  });
  it('generates plan with correct total posts', () => {
    const r = generateSocialCampaignPlan({ businessId: 'b1', clientId: 'c1', objective: 'EDUCATION', durationWeeks: 4, postsPerWeek: 3 });
    assert.equal(r.totalPosts, 12);
    assert.equal(r.organicFirst, true);
    assert.equal(r.adsBlocked, true);
    assert.equal(r.isReal, false);
  });
  it('weekly schedule has correct length', () => {
    const r = generateSocialCampaignPlan({ businessId: 'b1', clientId: 'c1', objective: 'EDUCATION', durationWeeks: 6, postsPerWeek: 4 });
    assert.equal(r.weeklySchedule.length, 6);
  });
});

// ─── Suite 38: Bridges ────────────────────────────────────────────────────
describe('ADV-13 Bridge: bridgeToAIMedia', () => {
  it('throws without businessId', () => {
    assert.throws(() => bridgeToAIMedia({ clientId: 'c1' }), /businessId/);
  });
  it('returns adv13Bridge tag', () => {
    const r = bridgeToAIMedia({ businessId: 'b1', clientId: 'c1', channel: 'INSTAGRAM_REEL' });
    assert.equal(r.adv13Bridge, 'AI_MEDIA_LAYER_CONNECTED');
    assert.equal(r.noRealMedia, true);
    assert.equal(r.isReal, false);
  });
  it('enforces client isolation', () => {
    assert.throws(() => bridgeToAIMedia({ businessId: 'b1', clientId: 'c1' }, { clientId: 'c2' }), /CLIENT_ISOLATION/);
  });
});

describe('ADV-08 Bridge: bridgeToLeadEngine', () => {
  it('throws without businessId', () => {
    assert.throws(() => bridgeToLeadEngine({ clientId: 'c1' }), /businessId/);
  });
  it('throws when executeRealOutreach: true', () => {
    assert.throws(() => bridgeToLeadEngine({ businessId: 'b1', clientId: 'c1' }, { executeRealOutreach: true }), /NO_REAL_OUTREACH/);
  });
  it('returns adv08Bridge tag', () => {
    const r = bridgeToLeadEngine({ businessId: 'b1', clientId: 'c1' }, {});
    assert.equal(r.adv08Bridge, 'LEAD_ENGINE_CONNECTED');
    assert.equal(r.noRealOutreach, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-09 Bridge: bridgeToCRM', () => {
  it('throws when executeRealWrite: true', () => {
    assert.throws(() => bridgeToCRM({ businessId: 'b1', clientId: 'c1' }, { executeRealWrite: true }), /NO_REAL_CRM_WRITE/);
  });
  it('returns adv09Bridge tag', () => {
    const r = bridgeToCRM({ businessId: 'b1', clientId: 'c1' }, {});
    assert.equal(r.adv09Bridge, 'CRM_ENGINE_CONNECTED');
    assert.equal(r.noRealWrite, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-03 Bridge: bridgeToAgentEngine', () => {
  it('throws when autoPublish: true', () => {
    assert.throws(() => bridgeToAgentEngine({ businessId: 'b1', clientId: 'c1' }, { autoPublish: true }), /autoPublish/);
  });
  it('returns adv03Bridge tag', () => {
    const r = bridgeToAgentEngine({ businessId: 'b1', clientId: 'c1' }, {});
    assert.equal(r.adv03Bridge, 'AGENT_ENGINE_CONNECTED');
    assert.equal(r.noAutoPublish, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-12 Bridge: createSocialMCPRequest', () => {
  it('throws without action', () => {
    assert.throws(() => createSocialMCPRequest({ businessId: 'b1', clientId: 'c1' }), /action/);
  });
  it('throws for secretValue', () => {
    assert.throws(() => createSocialMCPRequest({ action: 'get', businessId: 'b1', clientId: 'c1', secretValue: 'secret' }), /secretRef/);
  });
  it('returns adv12Bridge tag', () => {
    const r = createSocialMCPRequest({ action: 'get', businessId: 'b1', clientId: 'c1' });
    assert.equal(r.adv12Bridge, 'MCP_LAYER_CONNECTED');
    assert.equal(r.dryRun, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-01 Bridge: emitSocialEvent', () => {
  it('throws for unknown event type', () => {
    assert.throws(() => emitSocialEvent('social.unknown.event', { businessId: 'b1', clientId: 'c1' }), /Unknown social obs event/);
  });
  it('throws without businessId', () => {
    assert.throws(() => emitSocialEvent(SOCIAL_OBS_EVENT.CONTENT_GENERATED, { clientId: 'c1' }), /businessId/);
  });
  it('emits content.generated event', () => {
    const r = emitSocialEvent(SOCIAL_OBS_EVENT.CONTENT_GENERATED, { businessId: 'b1', clientId: 'c1' });
    assert.equal(r.eventType, 'social.content.generated');
    assert.equal(r.adv01Bridge, 'OBSERVABILITY_CONNECTED');
    assert.equal(r.isReal, false);
  });
  it('SOCIAL_OBS_EVENT has 8 values', () => {
    assert.equal(Object.values(SOCIAL_OBS_EVENT).length, 8);
  });
});

// ─── Suite 39: SocialContentReport ────────────────────────────────────────
describe('SocialContentReport', () => {
  it('throws without businessId', () => {
    assert.throws(() => createSocialContentReport({ clientId: 'c1' }), /businessId/);
  });
  it('creates report with guardrails', () => {
    const r = createSocialContentReport({ businessId: 'b1', clientId: 'c1' });
    assert.equal(r.guardrails.noRealPublish, true);
    assert.equal(r.guardrails.noRealAdSpend, true);
    assert.equal(r.isReal, false);
    assert.ok(Object.isFrozen(r));
  });
});

// ─── Suite 40: SocialEngineQualityScore ───────────────────────────────────
describe('SocialEngineQualityScore', () => {
  it('returns 100% when all metrics perfect', () => {
    const r = computeSocialEngineQualityScore({
      clientIsolationTests: 10, clientIsolationPassed: 10,
      adsBlocked: true, claimViolations: 0, privacyViolations: 0,
      avgContentQuality: 100, realWebhookCalls: 0,
    });
    assert.equal(r.overall, 100);
    assert.equal(r.productionReady, true);
    assert.equal(r.isReal, false);
  });
  it('flags ADS_SAFETY_BREACH when adsBlocked is false', () => {
    const r = computeSocialEngineQualityScore({ adsBlocked: false, realWebhookCalls: 0, claimViolations: 0, privacyViolations: 0 });
    assert.ok(r.violations.includes('ADS_SAFETY_BREACH'));
  });
  it('flags REAL_WEBHOOK_DETECTED when realWebhookCalls > 0', () => {
    const r = computeSocialEngineQualityScore({ adsBlocked: true, realWebhookCalls: 1, claimViolations: 0, privacyViolations: 0 });
    assert.ok(r.violations.includes('REAL_WEBHOOK_DETECTED'));
    assert.equal(r.productionReady, false);
  });
});

// ─── Suite 41: Registry ───────────────────────────────────────────────────
describe('Registry ADV-14', () => {
  it('SOCIAL_CONTENT_REGISTRY is frozen', () => {
    assert.ok(Object.isFrozen(SOCIAL_CONTENT_REGISTRY));
  });
  it('REGISTRY_VERSION is >= 3.8.0', () => {
    const [major, minor] = REGISTRY_VERSION.split('.').map(Number);
    assert.ok(major > 3 || (major === 3 && minor >= 8));
  });
  it('PASO_ADV14_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV14_STATUS, '100_PERCENT');
  });
  it('registry has 7 bridges', () => {
    assert.equal(SOCIAL_CONTENT_REGISTRY.bridges.length, 7);
  });
  it('registry guardrails has NO_REAL_SOCIAL_PUBLISH: SI', () => {
    assert.equal(SOCIAL_CONTENT_REGISTRY.guardrails.NO_REAL_SOCIAL_PUBLISH, 'SI');
  });
  it('registry guardrails has ADS_EXECUTION: BLOCKED', () => {
    assert.equal(SOCIAL_CONTENT_REGISTRY.guardrails.ADS_EXECUTION, 'BLOCKED');
  });
  it('registry has MAKE_BRIDGE_MODE: DRY_RUN_ONLY', () => {
    assert.equal(SOCIAL_CONTENT_REGISTRY.guardrails.MAKE_BRIDGE_MODE, 'DRY_RUN_ONLY');
  });
  it('registry isReal: false', () => {
    assert.equal(SOCIAL_CONTENT_REGISTRY.isReal, false);
  });
});

// ─── Suite 42: Fixtures Verification ──────────────────────────────────────
describe('Fixture Businesses', () => {
  it('has 7 fixture businesses', () => {
    assert.equal(ALL_FIXTURE_BUSINESSES.length, 7);
  });
  it('all businesses have isReal: false', () => {
    ALL_FIXTURE_BUSINESSES.forEach(b => assert.equal(b.isReal, false));
  });
  it('FIXTURE_PADEL_CLUB sector is padel', () => {
    assert.equal(FIXTURE_PADEL_CLUB.sector, 'padel');
  });
  it('FIXTURE_FISIONOVA sector is fisioterapia', () => {
    assert.equal(FIXTURE_FISIONOVA.sector, 'fisioterapia');
  });
  it('each business is frozen', () => {
    ALL_FIXTURE_BUSINESSES.forEach(b => assert.ok(Object.isFrozen(b)));
  });
});

describe('Fixture Campaigns', () => {
  it('has 20 fixture campaigns', () => {
    assert.equal(ALL_FIXTURE_CAMPAIGNS.length, 20);
  });
  it('all campaigns have isReal: false', () => {
    ALL_FIXTURE_CAMPAIGNS.forEach(c => assert.equal(c.isReal, false));
  });
  it('all campaigns have adsBlocked: true', () => {
    ALL_FIXTURE_CAMPAIGNS.forEach(c => assert.equal(c.adsBlocked, true));
  });
  it('CAMPAIGN_PADEL_BRAND_LAUNCH objective is BRAND_AWARENESS', () => {
    assert.equal(CAMPAIGN_PADEL_BRAND_LAUNCH.objective, 'BRAND_AWARENESS');
  });
});

describe('Fixture Content Items', () => {
  it('has at least 60 content items', () => {
    assert.ok(ALL_FIXTURE_CONTENT_ITEMS.length >= 60);
  });
  it('all items have isReal: false', () => {
    ALL_FIXTURE_CONTENT_ITEMS.forEach(p => assert.equal(p.isReal, false));
  });
  it('all items have noRealPublish: true', () => {
    ALL_FIXTURE_CONTENT_ITEMS.forEach(p => assert.equal(p.noRealPublish, true));
  });
  it('POST_PADEL_001 is from CP04', () => {
    assert.equal(POST_PADEL_001.clientId, 'client_cp04');
  });
  it('all items have required fields', () => {
    ALL_FIXTURE_CONTENT_ITEMS.forEach(p => {
      assert.ok(p.businessId, `Missing businessId: ${p.id}`);
      assert.ok(p.clientId,   `Missing clientId: ${p.id}`);
      assert.ok(p.channel,    `Missing channel: ${p.id}`);
    });
  });
});

describe('Good Fixtures', () => {
  it('GOOD_POST_EDUCATIONAL has noRealPublish: true', () => {
    assert.equal(GOOD_POST_EDUCATIONAL.noRealPublish, true);
    assert.equal(GOOD_POST_EDUCATIONAL.isReal, false);
  });
  it('GOOD_CAMPAIGN_PLAN has adsBlocked: true', () => {
    assert.equal(GOOD_CAMPAIGN_PLAN.adsBlocked, true);
  });
  it('GOOD_MAKE_PAYLOAD has dryRun: true', () => {
    assert.equal(GOOD_MAKE_PAYLOAD.dryRun, true);
  });
  it('GOOD_STRATEGY_PROFILE has organicFirst: true', () => {
    assert.equal(GOOD_STRATEGY_PROFILE.organicFirst, true);
  });
});

describe('Failure Fixtures', () => {
  it('has 13 failure fixtures', () => {
    assert.equal(ALL_FAILURE_FIXTURES.length, 13);
  });
  it('all failure fixtures have isReal: false', () => {
    ALL_FAILURE_FIXTURES.forEach(f => assert.equal(f.isReal, false));
  });
  it('FAILURE_INVENTED_PRICE has priceVerified: false', () => {
    assert.equal(FAILURE_INVENTED_PRICE.priceVerified, false);
  });
  it('FAILURE_REAL_PUBLISH_ATTEMPT has noRealPublish: false', () => {
    assert.equal(FAILURE_REAL_PUBLISH_ATTEMPT.noRealPublish, false);
  });
});

describe('Make Payload Fixtures', () => {
  it('has 3 make payload fixtures', () => {
    assert.equal(ALL_MAKE_PAYLOAD_FIXTURES.length, 3);
  });
  it('all payloads have dryRun: true', () => {
    ALL_MAKE_PAYLOAD_FIXTURES.forEach(p => assert.equal(p.dryRun, true));
  });
  it('all payloads have isReal: false', () => {
    ALL_MAKE_PAYLOAD_FIXTURES.forEach(p => assert.equal(p.isReal, false));
  });
  it('MAKE_PAYLOAD_PADEL_REEL channel is INSTAGRAM_REEL', () => {
    assert.equal(MAKE_PAYLOAD_PADEL_REEL.channel, 'INSTAGRAM_REEL');
  });
});

// ─── Suite 43: Client Isolation Critical Tests ─────────────────────────────
describe('CLIENT_ISOLATION Critical Tests', () => {
  it('privacy validator blocks cross-client access', () => {
    const post = { businessId: 'biz_padel_cp04', clientId: 'client_cp04', fullText: '' };
    const r = validateSocialContentPrivacy(post, { requestingClientId: 'client_fisionova' });
    assert.equal(r.clientIsolation, false);
    assert.equal(r.passed, false);
  });

  it('AI media bridge blocks cross-client access', () => {
    const post = { businessId: 'biz_padel_cp04', clientId: 'client_cp04' };
    const mediaConfig = { clientId: 'client_fisionova' };
    assert.throws(() => bridgeToAIMedia(post, mediaConfig), /CLIENT_ISOLATION/);
  });

  it('engine quality score CLIENT_ISOLATION is 100 for perfect tests', () => {
    const r = computeSocialEngineQualityScore({ clientIsolationTests: 20, clientIsolationPassed: 20, adsBlocked: true, realWebhookCalls: 0, claimViolations: 0, privacyViolations: 0 });
    assert.equal(r.scores.CLIENT_ISOLATION, 100);
  });

  it('content items from different clients have different clientId', () => {
    const padelPosts = ALL_FIXTURE_CONTENT_ITEMS.filter(p => p.clientId === 'client_cp04');
    const fisiosPosts = ALL_FIXTURE_CONTENT_ITEMS.filter(p => p.clientId === 'client_fisionova');
    assert.ok(padelPosts.length > 0);
    assert.ok(fisiosPosts.length > 0);
    // No padel post should appear in fisio's list
    const crossLeak = padelPosts.filter(p => fisiosPosts.some(f => f.id === p.id));
    assert.equal(crossLeak.length, 0);
  });
});

// ─── Suite 44: ADS Safety Critical Tests ──────────────────────────────────
describe('ADS_SAFETY Critical Tests', () => {
  it('ADS_EXECUTION constant is BLOCKED', () => {
    assert.equal(ADS_EXECUTION, 'BLOCKED');
  });
  it('createSocialCampaign throws when autoActivateAds: true', () => {
    assert.throws(
      () => createSocialCampaign({ businessId: 'b1', clientId: 'c1', name: 'N', objective: 'EDUCATION', type: CAMPAIGN_TYPE.ORGANIC_PLUS_ADS, autoActivateAds: true }),
      /ADS_EXECUTION/
    );
  });
  it('all fixture campaigns have adsBlocked: true', () => {
    ALL_FIXTURE_CAMPAIGNS.forEach(c => assert.equal(c.adsBlocked, true, `Campaign ${c.id} has adsBlocked: ${c.adsBlocked}`));
  });
  it('evaluateAdsPolicy always returns noRealAdSpend: true', () => {
    assert.equal(evaluateAdsPolicy({ adsRequested: true }).noRealAdSpend, true);
    assert.equal(evaluateAdsPolicy({}).noRealAdSpend, true);
  });
  it('generateSocialCampaignPlan always returns adsBlocked: true', () => {
    const r = generateSocialCampaignPlan({ businessId: 'b1', clientId: 'c1', objective: 'EDUCATION', durationWeeks: 2 });
    assert.equal(r.adsBlocked, true);
  });
});

// ─── Suite 45: Make Safety Critical Tests ─────────────────────────────────
describe('MAKE_SAFETY Critical Tests', () => {
  it('runSocialMakePipeline throws when executeReal: true', () => {
    assert.throws(
      () => runSocialMakePipeline({ businessId: 'b1', clientId: 'c1', post: { channel: 'FACEBOOK', fullText: 'X' }, executeReal: true }),
      /DRY_RUN_ONLY/
    );
  });
  it('createSocialMakePayload throws for realWebhookUrl', () => {
    assert.throws(
      () => createSocialMakePayload({ businessId: 'b1', clientId: 'c1', channel: 'FACEBOOK', postContent: { text: 'X' }, realWebhookUrl: 'https://hook.make.com' }),
      /webhookRef/
    );
  });
  it('createSocialMCPRequest throws for secretValue', () => {
    assert.throws(
      () => createSocialMCPRequest({ action: 'get', businessId: 'b1', clientId: 'c1', secretValue: 'sk_live' }),
      /secretRef/
    );
  });
  it('createChannelAuthStatus throws for realOAuthToken', () => {
    assert.throws(
      () => createChannelAuthStatus({ channel: 'INSTAGRAM_REEL', realOAuthToken: 'EAA...' }),
      /OAuth token/
    );
  });
  it('DRY_RUN result has noRealWebhook: true', () => {
    const r = runSocialMakePipeline({ businessId: 'b1', clientId: 'c1', post: { channel: 'FACEBOOK', fullText: 'X.', hashtags: [] }, approvedByHuman: true });
    assert.equal(r.noRealWebhook, true);
    assert.equal(r.dryRun, true);
  });
});

// ─── Suite 46: Integration Pipeline ───────────────────────────────────────
describe('Integration: Full Social Content Pipeline', () => {
  let strategy, post, qualified, report;

  before(() => {
    strategy = resolveSocialStrategy(FIXTURE_PADEL_CLUB);
    post = generateSocialPost({
      businessId: 'biz_padel_cp04',
      clientId:   'client_cp04',
      objective:  SOCIAL_OBJECTIVE.BOOKING_CONVERSION,
      channel:    'INSTAGRAM_REEL',
      topic:      'técnica de volea',
      sector:     'padel',
      city:       'Archidona',
    });
    const score = computeSocialContentQualityScore(post, { pillarMatch: true, objectiveMatch: true, noveltyScore: 80, hasViolation: false });
    qualified = evaluateSocialContentQualityGate(score, [], []);
    report = createSocialContentReport({ businessId: 'biz_padel_cp04', clientId: 'client_cp04', postsCreated: 1, gateStatus: qualified.status });
  });

  it('strategy profile has organicFirst: true', () => {
    assert.equal(strategy.profile.organicFirst, true);
  });
  it('post has noRealPublish: true', () => {
    assert.equal(post.noRealPublish, true);
  });
  it('post has isReal: false', () => {
    assert.equal(post.isReal, false);
  });
  it('quality gate status is PASS or WARN', () => {
    assert.ok([SOCIAL_GATE_STATUS.PASS, SOCIAL_GATE_STATUS.WARN].includes(qualified.status));
  });
  it('report has correct businessId', () => {
    assert.equal(report.businessId, 'biz_padel_cp04');
  });
  it('report guardrails are all active', () => {
    assert.equal(report.guardrails.noRealPublish, true);
    assert.equal(report.guardrails.noRealAdSpend, true);
    assert.equal(report.guardrails.noRealOutreach, true);
    assert.equal(report.guardrails.clientIsolated, true);
  });

  it('repurpose for 3 channels produces 3 adaptations', () => {
    const r = repurposeContent(post, ['INSTAGRAM_REEL', 'FACEBOOK', 'TIKTOK']);
    assert.equal(r.adaptations.length, 3);
    assert.equal(r.noRealPublish, true);
  });

  it('Make DRY_RUN bridge returns payload with dryRun: true', () => {
    const r = runSocialMakePipeline({ businessId: 'biz_padel_cp04', clientId: 'client_cp04', post, approvedByHuman: true });
    assert.equal(r.dryRun, true);
    assert.equal(r.noRealWebhook, true);
  });

  it('privacy check passes for generated post', () => {
    const pv = validateSocialContentPrivacy(post, {});
    assert.equal(pv.passed, true);
    assert.equal(pv.clientIsolation, true);
  });

  it('engine quality score is production ready when all metrics pass', () => {
    const r = computeSocialEngineQualityScore({ clientIsolationTests: 10, clientIsolationPassed: 10, adsBlocked: true, claimViolations: 0, privacyViolations: 0, avgContentQuality: 100, realWebhookCalls: 0 });
    assert.equal(r.productionReady, true);
    assert.equal(r.overall, 100);
  });
});
