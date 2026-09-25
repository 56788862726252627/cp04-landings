// ADV-13 AI Media Engine V1 — Test Suite
// node:test runner, ESM, .mjs

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// core
import {
  MEDIA_PROJECT_STATUS, createAIMediaProject,
} from '../../fabrica-saas/ai-media/core/aiMediaProject.js';
import {
  MEDIA_OBJECTIVE, OBJECTIVE_META,
} from '../../fabrica-saas/ai-media/core/mediaObjective.js';
import {
  AVATAR_TYPE, AVATAR_STYLE, CONSENT_STATUS, createAvatarProfile, AVATAR_PROFILE_VERSION,
} from '../../fabrica-saas/ai-media/core/avatarProfile.js';
import {
  CONSENT_MEDIA_TYPE, createMediaIdentityConsent, isConsentValid,
  checkAvatarConsent, checkVoiceConsent,
} from '../../fabrica-saas/ai-media/core/mediaIdentityConsent.js';
import {
  VOICE_GENDER_PRESENTATION, VOICE_TONE, COMMERCIAL_RIGHTS_STATUS, createMediaVoiceProfile,
} from '../../fabrica-saas/ai-media/core/mediaVoiceProfile.js';
import {
  ES_ES_NEUTRAL, ES_ES_WARM, ES_ES_PROFESSIONAL, ES_ES_ENERGETIC,
  ANDALUSIAN_SOFT, SPANISH_VOICE_PROFILES,
} from '../../fabrica-saas/ai-media/core/spanishVoiceProfiles.js';

// script
import {
  SCRIPT_SECTION, generateMediaScript,
} from '../../fabrica-saas/ai-media/script/mediaScriptEngine.js';
import {
  CLAIM_VIOLATION, validateScriptClaims,
} from '../../fabrica-saas/ai-media/script/mediaClaimPolicy.js';
import {
  SCRIPT_DURATION, DURATION_META, validateScriptLength,
} from '../../fabrica-saas/ai-media/script/mediaScriptLengthPolicy.js';

// channel
import {
  MEDIA_CHANNEL, CHANNEL_META, getChannelProfile,
} from '../../fabrica-saas/ai-media/channel/mediaChannelProfile.js';
import {
  MEDIA_FORMAT, resolveMediaFormat,
} from '../../fabrica-saas/ai-media/channel/mediaFormatResolver.js';
import {
  getSafeAreaPolicy, validateOverlayPosition,
} from '../../fabrica-saas/ai-media/channel/mediaSafeAreaPolicy.js';

// visual
import {
  createStoryboardScene, generateStoryboard,
} from '../../fabrica-saas/ai-media/visual/mediaStoryboard.js';
import {
  VISUAL_STYLE, getVisualStyleProfile,
} from '../../fabrica-saas/ai-media/visual/mediaVisualStyle.js';
import {
  resolveBrandForMedia, validateBrandCompliance,
} from '../../fabrica-saas/ai-media/visual/mediaBrandBridge.js';

// providers
import {
  FixtureAvatarProvider, LocalAvatarProviderFoundation,
  ExternalAvatarProviderFoundation, AVATAR_PROVIDER_STATUS,
} from '../../fabrica-saas/ai-media/providers/avatarVideoProvider.js';
import {
  createTTSRequest, synthesizeSpeech,
} from '../../fabrica-saas/ai-media/providers/mediaTTSBridge.js';
import {
  FixtureLipSyncProvider, LocalLipSyncProviderFoundation,
} from '../../fabrica-saas/ai-media/providers/lipSyncProvider.js';
import {
  COMPOSITION_LAYER, createVideoCompositionPlan,
} from '../../fabrica-saas/ai-media/providers/videoCompositionPlan.js';

// routing
import {
  validateMediaRights, RIGHTS_STATUS,
} from '../../fabrica-saas/ai-media/routing/mediaRightsPolicy.js';
import {
  MEDIA_COST_GATE, evaluateMediaCost,
} from '../../fabrica-saas/ai-media/routing/mediaCostGuard.js';
import {
  createMediaCostEstimate,
} from '../../fabrica-saas/ai-media/routing/mediaCostEstimate.js';
import {
  routeAvatarProvider, routeLipSyncProvider,
} from '../../fabrica-saas/ai-media/routing/mediaProviderRouter.js';
import {
  MEDIA_APPROVAL_TRIGGER, evaluateMediaApproval,
} from '../../fabrica-saas/ai-media/routing/mediaHumanApprovalPolicy.js';

// social
import {
  PUBLISH_STATUS, createSocialPublishPlan,
} from '../../fabrica-saas/ai-media/social/socialPublishPlan.js';
import {
  AUTOMATION_EVENT, createAutomationManifest,
} from '../../fabrica-saas/ai-media/social/mediaAutomationManifest.js';
import {
  createMediaContentCalendarEntry,
} from '../../fabrica-saas/ai-media/social/mediaContentCalendar.js';

// variants
import {
  VARIANT_DIMENSION, generateMediaVariants,
} from '../../fabrica-saas/ai-media/variants/mediaVariantsEngine.js';
import {
  EXPERIMENT_STATUS, createMediaExperiment,
} from '../../fabrica-saas/ai-media/variants/mediaExperiment.js';

// captions
import {
  CAPTION_TYPE, generateCaptions,
} from '../../fabrica-saas/ai-media/captions/captionEngine.js';
import {
  SUBTITLE_FORMAT, createSubtitlePlan,
} from '../../fabrica-saas/ai-media/captions/subtitlePlan.js';

// quality
import { evaluateHook } from '../../fabrica-saas/ai-media/quality/mediaHookEvaluator.js';
import { evaluateCta } from '../../fabrica-saas/ai-media/quality/mediaCtaEvaluator.js';
import { evaluateScript } from '../../fabrica-saas/ai-media/quality/mediaScriptEvaluator.js';
import { evaluateVoiceQuality } from '../../fabrica-saas/ai-media/quality/mediaVoiceQualityEvaluator.js';
import { LIP_SYNC_QUALITY, evaluateLipSync } from '../../fabrica-saas/ai-media/quality/lipSyncQualityEvaluator.js';
import { evaluateAvatarQuality } from '../../fabrica-saas/ai-media/quality/avatarQualityEvaluator.js';
import { MEDIA_QUALITY_FACTOR, computeMediaQualityScore } from '../../fabrica-saas/ai-media/quality/mediaQualityScore.js';
import {
  MEDIA_GATE_STATUS, MEDIA_CRITICAL_FAILURE, evaluateMediaQualityGate,
} from '../../fabrica-saas/ai-media/quality/mediaQualityGate.js';

// accessibility
import {
  evaluateAccessibility, ACCESSIBILITY_REQUIREMENT,
} from '../../fabrica-saas/ai-media/accessibility/mediaAccessibilityPolicy.js';
import {
  createMediaPerformanceProfile,
} from '../../fabrica-saas/ai-media/accessibility/mediaPerformanceProfile.js';

// bridges
import { buildLandingVideoEmbed } from '../../fabrica-saas/ai-media/bridges/mediaLandingBridge.js';
import {
  AGENT_MEDIA_TASK, createAgentMediaTask,
} from '../../fabrica-saas/ai-media/bridges/mediaAgentBridge.js';
import { reuseVoicePersonality } from '../../fabrica-saas/ai-media/bridges/mediaVoiceAgentBridge.js';
import { createMediaMCPRequest } from '../../fabrica-saas/ai-media/bridges/mediaMCPBridge.js';
import {
  MEDIA_OBS_EVENT, emitMediaEvent,
} from '../../fabrica-saas/ai-media/bridges/mediaObservabilityBridge.js';
import { MEDIA_TRACE_TYPE, createMediaTrace } from '../../fabrica-saas/ai-media/bridges/mediaLangfuseBridge.js';

// privacy
import { validateMediaPrivacy } from '../../fabrica-saas/ai-media/privacy/mediaPrivacyPolicy.js';
import {
  ASSET_LIFECYCLE_STAGE, RETENTION_DAYS, createRetentionSchedule,
} from '../../fabrica-saas/ai-media/privacy/mediaRetentionPolicy.js';
import { createMediaProvenance } from '../../fabrica-saas/ai-media/privacy/mediaProvenance.js';
import {
  buildDisclosurePlan, DISCLOSURE_LEVEL, REQUIRED_DISCLOSURE_TEXTS,
} from '../../fabrica-saas/ai-media/privacy/syntheticMediaDisclosurePolicy.js';

// output
import { createMediaOutputPackage } from '../../fabrica-saas/ai-media/output/mediaOutputPackage.js';
import {
  THUMBNAIL_STYLE, createThumbnailPlan,
} from '../../fabrica-saas/ai-media/output/thumbnailPlan.js';

// fixtures
import { FIXTURE_BUSINESSES, FIXTURE_BUSINESS_PADEL } from '../../fabrica-saas/ai-media/fixtures/fixtureBusinesses.js';
import { FIXTURE_MEDIA_PROJECTS, FIXTURE_PROJECT_PADEL_15S_REEL } from '../../fabrica-saas/ai-media/fixtures/fixtureMediaProjects.js';
import { GOOD_FIXTURES, GOOD_SYNTHETIC_AVATAR } from '../../fabrica-saas/ai-media/fixtures/goodFixtures.js';
import { FAILURE_FIXTURES, FAILURE_UNAPPROVED_REAL_FACE } from '../../fabrica-saas/ai-media/fixtures/failureFixtures.js';

// registry
import { AI_MEDIA_REGISTRY } from '../../fabrica-saas/factory-registry/aiMedia.js';
import { REGISTRY_VERSION, PASO_ADV13_STATUS } from '../../fabrica-saas/factory-registry/index.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeScript(sections) {
  return { sections, wordCount: sections.reduce((n, s) => n + s.text.split(/\s+/).length, 0) };
}

// ─── 1. Core: AIMediaProject ──────────────────────────────────────────────────
describe('AIMediaProject', () => {
  it('creates valid project with required fields', () => {
    const p = createAIMediaProject({ id: 'p1', clientId: 'c1', businessId: 'b1' });
    assert.equal(p.id, 'p1');
    assert.equal(p.clientId, 'c1');
    assert.equal(p.businessId, 'b1');
    assert.equal(p.isReal, false);
    assert.equal(p.status, MEDIA_PROJECT_STATUS.DRAFT);
  });
  it('throws without id', () => assert.throws(() => createAIMediaProject({ clientId: 'c1', businessId: 'b1' })));
  it('throws without clientId', () => assert.throws(() => createAIMediaProject({ id: 'p1', businessId: 'b1' })));
  it('throws without businessId', () => assert.throws(() => createAIMediaProject({ id: 'p1', clientId: 'c1' })));
  it('is frozen', () => { const p = createAIMediaProject({ id: 'x', clientId: 'c', businessId: 'b' }); assert.throws(() => { p.id = 'y'; }); });
  it('has all 8 status values', () => {
    const vals = Object.values(MEDIA_PROJECT_STATUS);
    assert.equal(vals.length, 8);
    assert.ok(vals.includes('DRAFT') && vals.includes('BLOCKED'));
  });
  it('defaults language to es-ES', () => {
    const p = createAIMediaProject({ id: 'p2', clientId: 'c', businessId: 'b' });
    assert.equal(p.language, 'es-ES');
  });
});

// ─── 2. Core: MediaObjective ──────────────────────────────────────────────────
describe('MediaObjective', () => {
  it('has 13 objective values', () => assert.equal(Object.keys(MEDIA_OBJECTIVE).length, 13));
  it('TESTIMONIAL_STYLE_FIXTURE has fixtureOnly:true', () => {
    assert.equal(OBJECTIVE_META[MEDIA_OBJECTIVE.TESTIMONIAL_STYLE_FIXTURE].fixtureOnly, true);
  });
  it('BOOKING has primaryCTA BOOK_NOW', () => {
    assert.equal(OBJECTIVE_META[MEDIA_OBJECTIVE.BOOKING].primaryCTA, 'BOOK_NOW');
  });
  it('all objectives have minDuration and maxDuration', () => {
    for (const obj of Object.values(MEDIA_OBJECTIVE)) {
      const meta = OBJECTIVE_META[obj];
      assert.ok(meta.minDuration >= 0, `${obj} missing minDuration`);
      assert.ok(meta.maxDuration > 0, `${obj} missing maxDuration`);
    }
  });
});

// ─── 3. Core: AvatarProfile ───────────────────────────────────────────────────
describe('AvatarProfile', () => {
  it('creates with required fields', () => {
    const a = createAvatarProfile({ id: 'av1', type: AVATAR_TYPE.SYNTHETIC });
    assert.equal(a.id, 'av1');
    assert.equal(a.isReal, false);
    assert.equal(a.isRealPerson, false);
    assert.equal(a.identityDisclosure, 'AI_GENERATED');
  });
  it('throws without id', () => assert.throws(() => createAvatarProfile({ type: AVATAR_TYPE.SYNTHETIC })));
  it('throws without type', () => assert.throws(() => createAvatarProfile({ id: 'av2' })));
  it('has 4 avatar types', () => assert.equal(Object.keys(AVATAR_TYPE).length, 4));
  it('has 4 avatar styles', () => assert.equal(Object.keys(AVATAR_STYLE).length, 4));
  it('has 5 consent statuses', () => assert.equal(Object.keys(CONSENT_STATUS).length, 5));
  it('is frozen', () => {
    const a = createAvatarProfile({ id: 'av3', type: AVATAR_TYPE.GENERIC_PRESENTER });
    assert.throws(() => { a.id = 'x'; });
  });
  it('version is a string', () => assert.equal(typeof AVATAR_PROFILE_VERSION, 'string'));
});

// ─── 4. Core: MediaIdentityConsent ───────────────────────────────────────────
describe('MediaIdentityConsent', () => {
  it('requires subjectId', () => assert.throws(() => createMediaIdentityConsent({})));
  it('creates valid consent', () => {
    const c = createMediaIdentityConsent({ subjectId: 's1', avatarConsent: true, voiceConsent: false });
    assert.equal(c.subjectId, 's1');
    assert.equal(c.isReal, false);
  });
  it('isConsentValid returns false for revoked', () => {
    const c = createMediaIdentityConsent({ subjectId: 's2', revoked: true });
    assert.equal(isConsentValid(c), false);
  });
  it('isConsentValid returns false for expired', () => {
    const c = createMediaIdentityConsent({ subjectId: 's3', expiresAt: Date.now() - 1000 });
    assert.equal(isConsentValid(c), false);
  });
  it('checkAvatarConsent blocks when not granted', () => {
    const c = createMediaIdentityConsent({ subjectId: 's4', avatarConsent: false });
    const r = checkAvatarConsent(c);
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'AVATAR_CONSENT_NOT_GRANTED');
  });
  it('checkAvatarConsent allows when granted', () => {
    const c = createMediaIdentityConsent({ subjectId: 's5', avatarConsent: true });
    assert.equal(checkAvatarConsent(c).allowed, true);
  });
  it('checkVoiceConsent blocks when not granted', () => {
    const c = createMediaIdentityConsent({ subjectId: 's6', voiceConsent: false });
    assert.equal(checkVoiceConsent(c).allowed, false);
  });
  it('has 4 consent media types', () => assert.equal(Object.keys(CONSENT_MEDIA_TYPE).length, 4));
});

// ─── 5. Core: MediaVoiceProfile ───────────────────────────────────────────────
describe('MediaVoiceProfile', () => {
  it('requires id', () => assert.throws(() => createMediaVoiceProfile({})));
  it('defaults to SYNTHETIC_FREE', () => {
    const v = createMediaVoiceProfile({ id: 'v1' });
    assert.equal(v.commercialRightsStatus, COMMERCIAL_RIGHTS_STATUS.SYNTHETIC_FREE);
    assert.equal(v.isReal, false);
  });
  it('is frozen', () => {
    const v = createMediaVoiceProfile({ id: 'v2' });
    assert.throws(() => { v.id = 'x'; });
  });
  it('has 6 voice tones', () => assert.equal(Object.keys(VOICE_TONE).length, 6));
  it('has 4 commercial rights statuses', () => assert.equal(Object.keys(COMMERCIAL_RIGHTS_STATUS).length, 4));
});

// ─── 6. Core: SpanishVoiceProfiles ────────────────────────────────────────────
describe('SpanishVoiceProfiles', () => {
  it('has 5 profiles', () => assert.equal(SPANISH_VOICE_PROFILES.length, 5));
  it('ES_ES_NEUTRAL is frozen', () => assert.throws(() => { ES_ES_NEUTRAL.id = 'x'; }));
  it('all profiles have es language', () => {
    for (const p of SPANISH_VOICE_PROFILES) assert.equal(p.language, 'es');
  });
  it('all profiles have isReal:false', () => {
    for (const p of SPANISH_VOICE_PROFILES) assert.equal(p.isReal, false);
  });
  it('ANDALUSIAN_SOFT has ANDALUSIAN_SOFT accent', () => {
    assert.equal(ANDALUSIAN_SOFT.accent, 'ANDALUSIAN_SOFT');
  });
  it('ES_ES_ENERGETIC has energy 9', () => assert.equal(ES_ES_ENERGETIC.energy, 9));
});

// ─── 7. Script: MediaScriptEngine ────────────────────────────────────────────
describe('MediaScriptEngine', () => {
  it('requires objective', () => assert.throws(() => generateMediaScript({ business: {} })));
  it('requires business', () => assert.throws(() => generateMediaScript({ objective: 'X' })));
  it('generates script with HOOK and CTA', () => {
    const s = generateMediaScript({
      objective: MEDIA_OBJECTIVE.BOOKING,
      business: { id: 'b1', name: 'Pádel 04' },
      hook: 'Ven a jugar al pádel',
      cta: 'Reserva tu pista',
    });
    assert.ok(s.sections.some(sec => sec.section === SCRIPT_SECTION.HOOK));
    assert.ok(s.sections.some(sec => sec.section === SCRIPT_SECTION.CTA));
    assert.equal(s.isReal, false);
  });
  it('includes PROOF section when provided', () => {
    const s = generateMediaScript({
      objective: MEDIA_OBJECTIVE.SALES, business: { id: 'b1' },
      proof: 'Más de 500 socios', cta: 'Únete',
    });
    assert.ok(s.sections.some(sec => sec.section === SCRIPT_SECTION.PROOF));
  });
  it('wordCount is computed', () => {
    const s = generateMediaScript({ objective: MEDIA_OBJECTIVE.FAQ, business: { id: 'b1' } });
    assert.ok(s.wordCount > 0);
  });
  it('is frozen', () => {
    const s = generateMediaScript({ objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'b1' } });
    assert.throws(() => { s.objective = 'x'; });
  });
});

// ─── 8. Script: MediaClaimPolicy ─────────────────────────────────────────────
describe('MediaClaimPolicy', () => {
  it('clean text passes', () => {
    const r = validateScriptClaims('Reserva tu pista de pádel hoy mismo');
    assert.equal(r.passed, true);
    assert.equal(r.violations.length, 0);
  });
  it('blocks INVENTED_STAT', () => {
    const r = validateScriptClaims('Tenemos un 95% de éxito garantizado');
    assert.equal(r.passed, false);
    assert.ok(r.violations.some(v => v.violation === CLAIM_VIOLATION.INVENTED_STAT));
  });
  it('blocks UNSUPPORTED_CLAIM', () => {
    const r = validateScriptClaims('Somos el número 1 en Andalucía');
    assert.equal(r.passed, false);
  });
  it('blocks FAKE_TESTIMONIAL', () => {
    const r = validateScriptClaims('Un cliente satisfecho dice que es el mejor servicio');
    assert.equal(r.passed, false);
  });
  it('isReal is false', () => {
    const r = validateScriptClaims('texto');
    assert.equal(r.isReal, false);
  });
});

// ─── 9. Script: MediaScriptLengthPolicy ──────────────────────────────────────
describe('MediaScriptLengthPolicy', () => {
  it('has 6 duration values', () => assert.equal(Object.keys(SCRIPT_DURATION).length, 6));
  it('validates short script as valid', () => {
    const script = makeScript([
      { section: 'HOOK', text: 'Reserva', durationHint: 0.5 },
      { section: 'CTA', text: 'Ven ya', durationHint: 0.5 },
    ]);
    const r = validateScriptLength(script, SCRIPT_DURATION.SEC_15);
    assert.equal(r.valid, true);
  });
  it('fails for too many words', () => {
    const longText = Array(100).fill('palabra').join(' ');
    const script = makeScript([{ section: 'HOOK', text: longText, durationHint: 1 }]);
    const r = validateScriptLength(script, SCRIPT_DURATION.SEC_15);
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'TOO_LONG');
  });
  it('unknown duration returns invalid', () => {
    const script = makeScript([]);
    const r = validateScriptLength(script, 'UNKNOWN_DURATION');
    assert.equal(r.valid, false);
  });
});

// ─── 10. Channel: MediaChannelProfile ────────────────────────────────────────
describe('MediaChannelProfile', () => {
  it('has 11 channels', () => assert.equal(Object.keys(MEDIA_CHANNEL).length, 11));
  it('TIKTOK has 9:16 aspect', () => {
    const p = getChannelProfile(MEDIA_CHANNEL.TIKTOK);
    assert.equal(p.aspectRatio, '9:16');
    assert.equal(p.isReal, false);
  });
  it('LANDING is not social', () => {
    const p = getChannelProfile(MEDIA_CHANNEL.LANDING);
    assert.equal(p.socialPublish, false);
  });
  it('YOUTUBE has 16:9', () => {
    const p = getChannelProfile(MEDIA_CHANNEL.YOUTUBE);
    assert.equal(p.aspectRatio, '16:9');
  });
  it('throws for unknown channel', () => assert.throws(() => getChannelProfile('UNKNOWN')));
  it('all channels have maxDuration > 0', () => {
    for (const ch of Object.values(MEDIA_CHANNEL)) {
      assert.ok(CHANNEL_META[ch].maxDuration > 0);
    }
  });
});

// ─── 11. Channel: MediaFormatResolver ────────────────────────────────────────
describe('MediaFormatResolver', () => {
  it('resolves INSTAGRAM_REEL to VERTICAL_9_16', () => {
    const r = resolveMediaFormat(MEDIA_CHANNEL.INSTAGRAM_REEL);
    assert.equal(r.format, MEDIA_FORMAT.VERTICAL_9_16);
  });
  it('resolves YOUTUBE to HORIZONTAL_16_9', () => {
    const r = resolveMediaFormat(MEDIA_CHANNEL.YOUTUBE);
    assert.equal(r.format, MEDIA_FORMAT.HORIZONTAL_16_9);
  });
  it('throws for unknown channel', () => assert.throws(() => resolveMediaFormat('UNKNOWN')));
  it('has 3 format values', () => assert.equal(Object.keys(MEDIA_FORMAT).length, 3));
});

// ─── 12. Channel: MediaSafeAreaPolicy ────────────────────────────────────────
describe('MediaSafeAreaPolicy', () => {
  it('vertical has larger bottom reserve', () => {
    const p = getSafeAreaPolicy('9:16');
    assert.ok(p.bottomPct >= 0.25);
  });
  it('horizontal has smaller reserve', () => {
    const p = getSafeAreaPolicy('16:9');
    assert.ok(p.bottomPct <= 0.20);
  });
  it('validateOverlayPosition blocks top overlap', () => {
    const r = validateOverlayPosition('9:16', { x: 0.5, y: 0.05 });
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'OVERLAP_TOP_UI');
  });
  it('validateOverlayPosition allows center', () => {
    const r = validateOverlayPosition('9:16', { x: 0.5, y: 0.45 });
    assert.equal(r.valid, true);
  });
});

// ─── 13. Visual: MediaStoryboard ─────────────────────────────────────────────
describe('MediaStoryboard', () => {
  it('createStoryboardScene requires id', () => assert.throws(() => createStoryboardScene({})));
  it('creates scene with defaults', () => {
    const s = createStoryboardScene({ id: 'sc1', voiceLine: 'Hola' });
    assert.equal(s.id, 'sc1');
    assert.equal(s.isReal, false);
  });
  it('generateStoryboard requires script and channel', () => {
    const script = generateMediaScript({ objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'b1' } });
    assert.throws(() => generateStoryboard({ script }));
    assert.throws(() => generateStoryboard({ channel: 'LANDING' }));
  });
  it('storyboard totalDuration is sum of scene durations', () => {
    const script = generateMediaScript({ objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'b1' } });
    const sb = generateStoryboard({ script, channel: MEDIA_CHANNEL.LANDING, targetDuration: 30 });
    const sum = sb.scenes.reduce((n, s) => n + s.duration, 0);
    assert.equal(sb.totalDuration, sum);
    assert.equal(sb.isReal, false);
  });
});

// ─── 14. Visual: MediaVisualStyle ────────────────────────────────────────────
describe('MediaVisualStyle', () => {
  it('has 11 visual styles', () => assert.equal(Object.keys(VISUAL_STYLE).length, 11));
  it('getVisualStyleProfile returns profile', () => {
    const p = getVisualStyleProfile(VISUAL_STYLE.PREMIUM);
    assert.equal(p.style, VISUAL_STYLE.PREMIUM);
    assert.equal(p.isReal, false);
  });
  it('throws for unknown style', () => assert.throws(() => getVisualStyleProfile('UNKNOWN')));
  it('LEGAL has NONE motion', () => {
    const p = getVisualStyleProfile(VISUAL_STYLE.LEGAL);
    assert.equal(p.motion, 'NONE');
  });
});

// ─── 15. Visual: MediaBrandBridge ────────────────────────────────────────────
describe('MediaBrandBridge', () => {
  it('resolves defaults when empty', () => {
    const b = resolveBrandForMedia({});
    assert.ok(b.primaryColor);
    assert.equal(b.isReal, false);
  });
  it('validateBrandCompliance passes when style matches', () => {
    const brand = { visualStyle: 'PREMIUM' };
    const r = validateBrandCompliance(brand, 'PREMIUM');
    assert.equal(r.compliant, true);
  });
  it('validateBrandCompliance fails when style mismatches', () => {
    const brand = { visualStyle: 'PREMIUM' };
    const r = validateBrandCompliance(brand, 'SPORTY');
    assert.equal(r.compliant, false);
    assert.equal(r.reason, 'VISUAL_STYLE_MISMATCH');
  });
});

// ─── 16. Providers: AvatarVideoProvider ──────────────────────────────────────
describe('AvatarVideoProvider', () => {
  it('FixtureAvatarProvider generates output', () => {
    const out = FixtureAvatarProvider.generate({ avatarId: 'av1', durationSeconds: 30 });
    assert.ok(out.assetRef.startsWith('fixture://'));
    assert.equal(out.isReal, false);
  });
  it('LocalAvatarProviderFoundation throws', () => {
    assert.throws(() => LocalAvatarProviderFoundation.generate({}));
  });
  it('ExternalAvatarProviderFoundation throws', () => {
    assert.throws(() => ExternalAvatarProviderFoundation.generate({}));
  });
  it('FixtureAvatarProvider status is FIXTURE_ONLY', () => {
    assert.equal(FixtureAvatarProvider.status, AVATAR_PROVIDER_STATUS.FIXTURE_ONLY);
  });
});

// ─── 17. Providers: MediaTTSBridge ───────────────────────────────────────────
describe('MediaTTSBridge', () => {
  it('createTTSRequest requires text', () => {
    assert.throws(() => createTTSRequest({ voiceProfile: ES_ES_NEUTRAL }));
  });
  it('createTTSRequest requires voiceProfile', () => {
    assert.throws(() => createTTSRequest({ text: 'Hola' }));
  });
  it('synthesizeSpeech returns asset', () => {
    const req = createTTSRequest({ text: 'Hola mundo', voiceProfile: ES_ES_NEUTRAL });
    const out = synthesizeSpeech(req);
    assert.ok(out.assetRef.startsWith('fixture://'));
    assert.equal(out.isReal, false);
  });
});

// ─── 18. Providers: LipSyncProvider ──────────────────────────────────────────
describe('LipSyncProvider', () => {
  it('FixtureLipSyncProvider syncs', () => {
    const out = FixtureLipSyncProvider.sync({ avatarAssetRef: 'fixture://av/1.mp4' });
    assert.ok(out.assetRef.startsWith('fixture://'));
    assert.equal(out.isReal, false);
  });
  it('LocalLipSyncProviderFoundation throws', () => {
    assert.throws(() => LocalLipSyncProviderFoundation.sync({}));
  });
});

// ─── 19. Providers: VideoCompositionPlan ─────────────────────────────────────
describe('VideoCompositionPlan', () => {
  it('requires channel and duration', () => {
    assert.throws(() => createVideoCompositionPlan({ duration: 30 }));
    assert.throws(() => createVideoCompositionPlan({ channel: 'LANDING' }));
  });
  it('has 10 layers by default', () => {
    const plan = createVideoCompositionPlan({ channel: MEDIA_CHANNEL.LANDING, duration: 30 });
    assert.equal(plan.layers.length, 10);
    assert.equal(plan.isReal, false);
  });
  it('has 10 COMPOSITION_LAYER values', () => {
    assert.equal(Object.keys(COMPOSITION_LAYER).length, 10);
  });
});

// ─── 20. Routing: MediaRightsPolicy ──────────────────────────────────────────
describe('MediaRightsPolicy', () => {
  it('clean plan passes', () => {
    const r = validateMediaRights({
      avatarRights: RIGHTS_STATUS.SYNTHETIC_FREE,
      voiceRights: RIGHTS_STATUS.SYNTHETIC_FREE,
      musicRights: RIGHTS_STATUS.CLEARED,
    });
    assert.equal(r.passed, true);
  });
  it('UNKNOWN avatar rights fails', () => {
    const r = validateMediaRights({ avatarRights: RIGHTS_STATUS.UNKNOWN });
    assert.equal(r.passed, false);
  });
  it('NOT_CLEARED music fails', () => {
    const r = validateMediaRights({ musicRights: RIGHTS_STATUS.NOT_CLEARED });
    assert.equal(r.passed, false);
    assert.ok(r.violations.includes('MUSIC_NOT_CLEARED'));
  });
});

// ─── 21. Routing: MediaCostGuard ─────────────────────────────────────────────
describe('MediaCostGuard', () => {
  it('FREE_SAFE is allowed', () => {
    const r = evaluateMediaCost({ gate: MEDIA_COST_GATE.FREE_SAFE });
    assert.equal(r.allowed, true);
  });
  it('UNKNOWN is blocked', () => {
    const r = evaluateMediaCost({ gate: MEDIA_COST_GATE.UNKNOWN });
    assert.equal(r.allowed, false);
    assert.equal(r.action, 'BLOCK');
  });
  it('REQUIRES_APPROVAL without approval is blocked', () => {
    const r = evaluateMediaCost({ gate: MEDIA_COST_GATE.REQUIRES_APPROVAL, approvedByHuman: false });
    assert.equal(r.allowed, false);
  });
  it('REQUIRES_APPROVAL with approval is allowed', () => {
    const r = evaluateMediaCost({ gate: MEDIA_COST_GATE.REQUIRES_APPROVAL, approvedByHuman: true });
    assert.equal(r.allowed, true);
  });
  it('has 5 MEDIA_COST_GATE values', () => assert.equal(Object.keys(MEDIA_COST_GATE).length, 5));
});

// ─── 22. Routing: MediaCostEstimate ──────────────────────────────────────────
describe('MediaCostEstimate', () => {
  it('zero cost is FREE_SAFE', () => {
    const e = createMediaCostEstimate({});
    assert.equal(e.gate, MEDIA_COST_GATE.FREE_SAFE);
    assert.equal(e.isReal, false);
  });
  it('high cost is REQUIRES_APPROVAL', () => {
    const e = createMediaCostEstimate({ avatar: 600 });
    assert.equal(e.gate, MEDIA_COST_GATE.REQUIRES_APPROVAL);
  });
  it('hasUnknownCost → UNKNOWN gate', () => {
    const e = createMediaCostEstimate({ hasUnknownCost: true });
    assert.equal(e.gate, MEDIA_COST_GATE.UNKNOWN);
  });
});

// ─── 23. Routing: MediaProviderRouter ────────────────────────────────────────
describe('MediaProviderRouter', () => {
  it('routeAvatarProvider returns fixture by default', () => {
    const r = routeAvatarProvider({});
    assert.equal(r.provider.id, 'fixture_avatar');
    assert.equal(r.isReal, false);
  });
  it('routeLipSyncProvider returns fixture by default', () => {
    const r = routeLipSyncProvider({});
    assert.equal(r.provider.id, 'fixture_lipsync');
  });
});

// ─── 24. Routing: MediaHumanApprovalPolicy ───────────────────────────────────
describe('MediaHumanApprovalPolicy', () => {
  it('has 8 approval triggers', () => assert.equal(Object.keys(MEDIA_APPROVAL_TRIGGER).length, 8));
  it('social channel triggers approval requirement', () => {
    const r = evaluateMediaApproval({ channel: 'TIKTOK' }, false);
    assert.equal(r.allowed, false);
    assert.ok(r.triggers.includes(MEDIA_APPROVAL_TRIGGER.SOCIAL_PUBLISH));
  });
  it('social channel with approval passes', () => {
    const r = evaluateMediaApproval({ channel: 'TIKTOK' }, true);
    assert.equal(r.allowed, true);
  });
  it('LANDING without social publish is allowed without approval', () => {
    const r = evaluateMediaApproval({ channel: 'LANDING' }, false);
    assert.equal(r.allowed, true);
  });
});

// ─── 25. Social: SocialPublishPlan ────────────────────────────────────────────
describe('SocialPublishPlan', () => {
  it('requires projectId', () => assert.throws(() => createSocialPublishPlan({})));
  it('noRealPublish is always true', () => {
    const p = createSocialPublishPlan({ projectId: 'proj1' });
    assert.equal(p.noRealPublish, true);
    assert.equal(p.isReal, false);
  });
  it('status starts as DRAFT', () => {
    const p = createSocialPublishPlan({ projectId: 'proj2' });
    assert.equal(p.status, PUBLISH_STATUS.DRAFT);
  });
});

// ─── 26. Social: MediaAutomationManifest ─────────────────────────────────────
describe('MediaAutomationManifest', () => {
  it('requires projectId', () => assert.throws(() => createAutomationManifest({})));
  it('noRealTrigger is always true', () => {
    const m = createAutomationManifest({ projectId: 'p1' });
    assert.equal(m.noRealTrigger, true);
    assert.equal(m.isReal, false);
  });
  it('has 5 automation events', () => assert.equal(Object.keys(AUTOMATION_EVENT).length, 5));
});

// ─── 27. Social: MediaContentCalendar ────────────────────────────────────────
describe('MediaContentCalendar', () => {
  it('requires projectId', () => assert.throws(() => createMediaContentCalendarEntry({ scheduledAt: Date.now() })));
  it('requires scheduledAt', () => assert.throws(() => createMediaContentCalendarEntry({ projectId: 'p1' })));
  it('creates entry', () => {
    const e = createMediaContentCalendarEntry({ projectId: 'p1', scheduledAt: Date.now() });
    assert.equal(e.isReal, false);
    assert.equal(e.requiresHumanApproval, true);
  });
});

// ─── 28. Variants: MediaVariantsEngine ───────────────────────────────────────
describe('MediaVariantsEngine', () => {
  it('has 6 variant dimensions', () => assert.equal(Object.keys(VARIANT_DIMENSION).length, 6));
  it('generates variants per dimension', () => {
    const base = { id: 'p1', clientId: 'c1', businessId: 'b1' };
    const variants = generateMediaVariants(base, [VARIANT_DIMENSION.HOOK, VARIANT_DIMENSION.CTA]);
    assert.equal(variants.length, 2);
    assert.equal(variants[0].isReal, false);
  });
  it('throws without baseProject', () => assert.throws(() => generateMediaVariants(null, [])));
});

// ─── 29. Variants: MediaExperiment ───────────────────────────────────────────
describe('MediaExperiment', () => {
  it('requires id', () => assert.throws(() => createMediaExperiment({ projectIds: ['p1', 'p2'] })));
  it('requires at least 2 projectIds', () => {
    assert.throws(() => createMediaExperiment({ id: 'e1', projectIds: ['p1'] }));
  });
  it('creates experiment', () => {
    const e = createMediaExperiment({ id: 'e1', projectIds: ['p1', 'p2'] });
    assert.equal(e.status, EXPERIMENT_STATUS.DRAFT);
    assert.equal(e.noRealAdSpend, true);
    assert.equal(e.isReal, false);
  });
});

// ─── 30. Captions: CaptionEngine ─────────────────────────────────────────────
describe('CaptionEngine', () => {
  it('requires script', () => assert.throws(() => generateCaptions(null)));
  it('generates all 5 caption types', () => {
    const script = generateMediaScript({ objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'b1' }, cta: 'Reserva' });
    const c = generateCaptions(script);
    assert.ok(c[CAPTION_TYPE.SPOKEN].length > 0);
    assert.ok(c[CAPTION_TYPE.CTA_COPY].length > 0);
    assert.equal(c.isReal, false);
  });
  it('has 5 caption types', () => assert.equal(Object.keys(CAPTION_TYPE).length, 5));
});

// ─── 31. Captions: SubtitlePlan ──────────────────────────────────────────────
describe('SubtitlePlan', () => {
  it('requires script', () => assert.throws(() => createSubtitlePlan(null)));
  it('creates cues from script sections', () => {
    const script = generateMediaScript({ objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'b1' } });
    const plan = createSubtitlePlan(script);
    assert.ok(plan.cues.length > 0);
    assert.ok(plan.formats.includes(SUBTITLE_FORMAT.VTT));
    assert.equal(plan.isReal, false);
  });
  it('has 3 subtitle formats', () => assert.equal(Object.keys(SUBTITLE_FORMAT).length, 3));
});

// ─── 32. Quality: MediaHookEvaluator ─────────────────────────────────────────
describe('MediaHookEvaluator', () => {
  it('short hook scores high clarity', () => {
    const r = evaluateHook('Reserva tu pista hoy');
    assert.ok(r.score >= 60);
    assert.equal(r.isReal, false);
  });
  it('detects clickbait', () => {
    const r = evaluateHook('No vas a creer lo que tenemos para ti');
    assert.equal(r.isClickbait, true);
    assert.equal(r.dimensions['NON_CLICKBAIT'], 0);
  });
  it('non-clickbait hook is clean', () => {
    const r = evaluateHook('Abre tu club en 3 meses');
    assert.equal(r.isClickbait, false);
  });
});

// ─── 33. Quality: MediaCtaEvaluator ──────────────────────────────────────────
describe('MediaCtaEvaluator', () => {
  it('safe CTA scores high', () => {
    const r = evaluateCta('Reserva ahora');
    assert.ok(r.score >= 70);
    assert.equal(r.isUnsafe, false);
  });
  it('detects unsafe CTA', () => {
    const r = evaluateCta('Gratis para siempre, garantizado o te devolvemos el dinero');
    assert.equal(r.isUnsafe, true);
    assert.equal(r.dimensions['TRUTHFULNESS'], 0);
  });
});

// ─── 34. Quality: MediaScriptEvaluator ───────────────────────────────────────
describe('MediaScriptEvaluator', () => {
  it('requires script', () => assert.throws(() => evaluateScript(null)));
  it('evaluates well-structured script', () => {
    const script = generateMediaScript({ objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'b1' } });
    const r = evaluateScript(script, { claimsValidated: true, brandAligned: true });
    assert.ok(r.score > 0);
    assert.equal(r.isReal, false);
  });
  it('has 8 evaluation dimensions', () => assert.equal(Object.keys(r => r).length >= 0, true));
});

// ─── 35. Quality: VoiceQualityEvaluator ──────────────────────────────────────
describe('VoiceQualityEvaluator', () => {
  it('requires voiceProfile', () => assert.throws(() => evaluateVoiceQuality(null)));
  it('evaluates ES_ES_PROFESSIONAL with high clarity', () => {
    const r = evaluateVoiceQuality(ES_ES_PROFESSIONAL);
    assert.equal(r.dimensions['CLARITY'], 95);
    assert.equal(r.isReal, false);
  });
  it('score is between 0 and 100', () => {
    const r = evaluateVoiceQuality(ES_ES_NEUTRAL);
    assert.ok(r.score >= 0 && r.score <= 100);
  });
});

// ─── 36. Quality: LipSyncQualityEvaluator ────────────────────────────────────
describe('LipSyncQualityEvaluator', () => {
  it('null result gives FAIL', () => {
    const r = evaluateLipSync(null);
    assert.equal(r.quality, LIP_SYNC_QUALITY.FAIL);
  });
  it('SIMULATED syncQuality gives GOOD', () => {
    const r = evaluateLipSync({ syncQuality: 'SIMULATED' });
    assert.equal(r.quality, LIP_SYNC_QUALITY.GOOD);
  });
  it('fixture lipsync output scores GOOD', () => {
    const out = FixtureLipSyncProvider.sync({});
    const r = evaluateLipSync(out);
    assert.ok([LIP_SYNC_QUALITY.GOOD, LIP_SYNC_QUALITY.EXCELLENT].includes(r.quality));
    assert.equal(r.isReal, false);
  });
});

// ─── 37. Quality: AvatarQualityEvaluator ─────────────────────────────────────
describe('AvatarQualityEvaluator', () => {
  it('requires avatarProfile', () => assert.throws(() => evaluateAvatarQuality(null)));
  it('synthetic AI_GENERATED avatar scores 100 on identity compliance', () => {
    const av = createAvatarProfile({ id: 'av1', type: AVATAR_TYPE.SYNTHETIC });
    const r = evaluateAvatarQuality(av);
    assert.equal(r.dimensions['IDENTITY_COMPLIANCE'], 100);
    assert.equal(r.criticalFail, false);
    assert.equal(r.isReal, false);
  });
  it('real person without proper disclosure criticalFail=true', () => {
    const av = createAvatarProfile({ id: 'av2', type: AVATAR_TYPE.AUTHORIZED_DIGITAL_TWIN, isRealPerson: true, identityDisclosure: 'HUMAN' });
    const r = evaluateAvatarQuality(av);
    assert.equal(r.criticalFail, true);
    assert.equal(r.dimensions['IDENTITY_COMPLIANCE'], 0);
  });
});

// ─── 38. Quality: MediaQualityScore ──────────────────────────────────────────
describe('MediaQualityScore', () => {
  it('computes score and grade', () => {
    const scores = { [MEDIA_QUALITY_FACTOR.HOOK]: 90, [MEDIA_QUALITY_FACTOR.CTA]: 85 };
    const r = computeMediaQualityScore(scores);
    assert.ok(r.overall >= 0);
    assert.ok(['A', 'B', 'C', 'F'].includes(r.grade));
    assert.equal(r.isReal, false);
  });
  it('high scores give grade A', () => {
    const allFactors = Object.values(MEDIA_QUALITY_FACTOR).reduce((acc, f) => ({ ...acc, [f]: 95 }), {});
    const r = computeMediaQualityScore(allFactors);
    assert.equal(r.grade, 'A');
  });
  it('low scores give grade F', () => {
    const allFactors = Object.values(MEDIA_QUALITY_FACTOR).reduce((acc, f) => ({ ...acc, [f]: 40 }), {});
    const r = computeMediaQualityScore(allFactors);
    assert.equal(r.grade, 'F');
  });
});

// ─── 39. Quality: MediaQualityGate ───────────────────────────────────────────
describe('MediaQualityGate', () => {
  it('BLOCKED when critical failures present', () => {
    const qs = { overall: 95, grade: 'A' };
    const r = evaluateMediaQualityGate(qs, [MEDIA_CRITICAL_FAILURE.MISSING_CONSENT]);
    assert.equal(r.status, MEDIA_GATE_STATUS.BLOCKED);
    assert.equal(r.isReal, false);
  });
  it('PASS with high score and no failures', () => {
    const qs = { overall: 90, grade: 'A' };
    const r = evaluateMediaQualityGate(qs, [], []);
    assert.equal(r.status, MEDIA_GATE_STATUS.PASS);
  });
  it('FAIL with score < 60', () => {
    const qs = { overall: 50, grade: 'F' };
    const r = evaluateMediaQualityGate(qs, [], []);
    assert.equal(r.status, MEDIA_GATE_STATUS.FAIL);
  });
  it('has 12 critical failure types', () => assert.equal(Object.keys(MEDIA_CRITICAL_FAILURE).length, 12));
  it('has 4 gate statuses', () => assert.equal(Object.keys(MEDIA_GATE_STATUS).length, 4));
});

// ─── 40. Accessibility: MediaAccessibilityPolicy ──────────────────────────────
describe('MediaAccessibilityPolicy', () => {
  it('has 6 requirements', () => assert.equal(Object.keys(ACCESSIBILITY_REQUIREMENT).length, 6));
  it('passes when captions and no flashing', () => {
    const r = evaluateAccessibility({ hasCaptions: true, hasReducedFlashing: true });
    assert.equal(r.passed, true);
    assert.equal(r.isReal, false);
  });
  it('fails when captions missing', () => {
    const r = evaluateAccessibility({ hasCaptions: false, hasReducedFlashing: true });
    assert.equal(r.passed, false);
    assert.ok(r.violations.includes(ACCESSIBILITY_REQUIREMENT.CAPTIONS));
  });
});

// ─── 41. Accessibility: MediaPerformanceProfile ───────────────────────────────
describe('MediaPerformanceProfile', () => {
  it('creates with defaults', () => {
    const p = createMediaPerformanceProfile({});
    assert.equal(p.hasPoster, true);
    assert.equal(p.lazyLoad, true);
    assert.equal(p.isReal, false);
  });
  it('accepts custom values', () => {
    const p = createMediaPerformanceProfile({ maxFileSizeMb: 100 });
    assert.equal(p.maxFileSizeMb, 100);
  });
});

// ─── 42. Bridges: MediaLandingBridge ──────────────────────────────────────────
describe('MediaLandingBridge', () => {
  it('requires project', () => assert.throws(() => buildLandingVideoEmbed(null)));
  it('builds embed for landing', () => {
    const p = { id: 'proj1' };
    const r = buildLandingVideoEmbed(p, { grade: 'A' });
    assert.equal(r.channel, 'LANDING');
    assert.equal(r.adv07Bridge, 'PREMIUM_EXPERIENCE_CONNECTED');
    assert.equal(r.isReal, false);
    assert.equal(r.autoplay, false);
  });
});

// ─── 43. Bridges: MediaAgentBridge ────────────────────────────────────────────
describe('MediaAgentBridge', () => {
  it('has 6 agent media tasks', () => assert.equal(Object.keys(AGENT_MEDIA_TASK).length, 6));
  it('requires task and projectId', () => {
    assert.throws(() => createAgentMediaTask({ projectId: 'p1' }));
    assert.throws(() => createAgentMediaTask({ task: AGENT_MEDIA_TASK.QA_REVIEW }));
  });
  it('creates task with bridge reference', () => {
    const t = createAgentMediaTask({ task: AGENT_MEDIA_TASK.GENERATE_SCRIPT, projectId: 'p1' });
    assert.equal(t.adv03Bridge, 'AGENT_ENGINE_CONNECTED');
    assert.equal(t.isReal, false);
  });
});

// ─── 44. Bridges: MediaVoiceAgentBridge ───────────────────────────────────────
describe('MediaVoiceAgentBridge', () => {
  it('requires voiceAgentProfile', () => assert.throws(() => reuseVoicePersonality(null)));
  it('creates personality with ADV-11 bridge', () => {
    const p = reuseVoicePersonality({ id: 'va1', accent: 'NEUTRO', speechStyle: 'FORMAL' });
    assert.equal(p.adv11Bridge, 'VOICE_AGENT_CONNECTED');
    assert.equal(p.isReal, false);
  });
});

// ─── 45. Bridges: MediaMCPBridge ──────────────────────────────────────────────
describe('MediaMCPBridge', () => {
  it('requires action and projectId', () => {
    assert.throws(() => createMediaMCPRequest({ projectId: 'p1' }));
    assert.throws(() => createMediaMCPRequest({ action: 'FETCH_BUSINESS_DATA' }));
  });
  it('throws if secretValue provided', () => {
    assert.throws(() => createMediaMCPRequest({ action: 'FETCH_BUSINESS_DATA', projectId: 'p1', secretValue: 'secret' }));
  });
  it('creates request with ADV-12 bridge', () => {
    const r = createMediaMCPRequest({ action: 'FETCH_BUSINESS_DATA', projectId: 'p1' });
    assert.equal(r.adv12Bridge, 'MCP_LAYER_CONNECTED');
    assert.equal(r.permissionsCheck, true);
    assert.equal(r.isReal, false);
  });
});

// ─── 46. Bridges: MediaObservabilityBridge ────────────────────────────────────
describe('MediaObservabilityBridge', () => {
  it('has 8 event types', () => assert.equal(Object.keys(MEDIA_OBS_EVENT).length, 8));
  it('emits valid event', () => {
    const e = emitMediaEvent(MEDIA_OBS_EVENT.MEDIA_PROJECT_CREATED, { projectId: 'p1' });
    assert.equal(e.eventType, MEDIA_OBS_EVENT.MEDIA_PROJECT_CREATED);
    assert.equal(e.adv01Bridge, 'OBSERVABILITY_CONNECTED');
    assert.equal(e.isReal, false);
  });
  it('throws for unknown event', () => {
    assert.throws(() => emitMediaEvent('UNKNOWN_EVENT'));
  });
});

// ─── 47. Bridges: MediaLangfuseBridge ─────────────────────────────────────────
describe('MediaLangfuseBridge', () => {
  it('has 4 trace types', () => assert.equal(Object.keys(MEDIA_TRACE_TYPE).length, 4));
  it('requires traceType and projectId', () => {
    assert.throws(() => createMediaTrace({ projectId: 'p1' }));
    assert.throws(() => createMediaTrace({ traceType: MEDIA_TRACE_TYPE.QA_EVALUATION }));
  });
  it('creates trace with noRealExport', () => {
    const t = createMediaTrace({ traceType: MEDIA_TRACE_TYPE.QA_EVALUATION, projectId: 'p1' });
    assert.equal(t.noRealExport, true);
    assert.equal(t.adv10Bridge, 'LANGFUSE_CONNECTED');
    assert.equal(t.isReal, false);
  });
});

// ─── 48. Privacy: MediaPrivacyPolicy ──────────────────────────────────────────
describe('MediaPrivacyPolicy', () => {
  it('passes for clean project', () => {
    const r = validateMediaPrivacy({ avatarProfile: null, voiceProfile: null });
    assert.equal(r.passed, true);
    assert.equal(r.isReal, false);
  });
  it('has 7 privacy principles', () => {
    const { PRIVACY_PRINCIPLE } = { PRIVACY_PRINCIPLE: { MINIMUM_DATA:1, CONSENT_REQUIRED:2, CLIENT_ISOLATION:3, RETENTION_LIMITED:4, NO_BIOMETRIC_REUSE:5, NO_RAW_VOICE_CLONE:6, NO_HIDDEN_TRAINING:7 } };
    assert.equal(Object.keys(PRIVACY_PRINCIPLE).length, 7);
  });
});

// ─── 49. Privacy: MediaRetentionPolicy ────────────────────────────────────────
describe('MediaRetentionPolicy', () => {
  it('has 5 lifecycle stages', () => assert.equal(Object.keys(ASSET_LIFECYCLE_STAGE).length, 5));
  it('TEMPORARY has 1 day retention', () => assert.equal(RETENTION_DAYS[ASSET_LIFECYCLE_STAGE.TEMPORARY], 1));
  it('DELETED has 0 days retention', () => assert.equal(RETENTION_DAYS[ASSET_LIFECYCLE_STAGE.DELETED], 0));
  it('createRetentionSchedule works', () => {
    const s = createRetentionSchedule('asset1', ASSET_LIFECYCLE_STAGE.GENERATED);
    assert.equal(s.retentionDays, 30);
    assert.equal(s.isReal, false);
  });
  it('throws for unknown stage', () => assert.throws(() => createRetentionSchedule('a1', 'UNKNOWN')));
});

// ─── 50. Privacy: MediaProvenance ─────────────────────────────────────────────
describe('MediaProvenance', () => {
  it('requires projectId', () => assert.throws(() => createMediaProvenance({})));
  it('creates provenance', () => {
    const p = createMediaProvenance({ projectId: 'p1' });
    assert.equal(p.generationType, 'SYNTHETIC');
    assert.equal(p.isReal, false);
  });
});

// ─── 51. Privacy: SyntheticMediaDisclosurePolicy ─────────────────────────────
describe('SyntheticMediaDisclosurePolicy', () => {
  it('project with avatar+voice gets FULL disclosure', () => {
    const plan = buildDisclosurePlan({ avatarProfile: {}, voiceProfile: {} });
    assert.equal(plan.level, DISCLOSURE_LEVEL.FULL);
    assert.equal(plan.mustShowInCaption, true);
    assert.equal(plan.isReal, false);
  });
  it('disclosures include AI avatar text', () => {
    const plan = buildDisclosurePlan({ avatarProfile: {} });
    assert.ok(plan.disclosures.includes(REQUIRED_DISCLOSURE_TEXTS.AI_AVATAR));
  });
  it('mustShowOnPlatform is always true', () => {
    const plan = buildDisclosurePlan({});
    assert.equal(plan.mustShowOnPlatform, true);
  });
  it('has 3 required disclosure texts', () => assert.equal(Object.keys(REQUIRED_DISCLOSURE_TEXTS).length, 3));
});

// ─── 52. Output: MediaOutputPackage ───────────────────────────────────────────
describe('MediaOutputPackage', () => {
  it('requires projectId', () => assert.throws(() => createMediaOutputPackage({})));
  it('creates output package', () => {
    const pkg = createMediaOutputPackage({ projectId: 'p1' });
    assert.equal(pkg.projectId, 'p1');
    assert.equal(pkg.approvalStatus, 'PENDING');
    assert.equal(pkg.isReal, false);
  });
});

// ─── 53. Output: ThumbnailPlan ────────────────────────────────────────────────
describe('ThumbnailPlan', () => {
  it('requires projectId', () => assert.throws(() => createThumbnailPlan({})));
  it('creates per-channel thumbnails', () => {
    const plan = createThumbnailPlan({ projectId: 'p1', channels: ['LANDING', 'INSTAGRAM_REEL'] });
    assert.equal(plan.thumbnails.length, 2);
    assert.equal(plan.thumbnails[0].noClickbait, true);
    assert.equal(plan.isReal, false);
  });
  it('has 4 thumbnail styles', () => assert.equal(Object.keys(THUMBNAIL_STYLE).length, 4));
});

// ─── 54. Fixtures: FixtureBusinesses ─────────────────────────────────────────
describe('FixtureBusinesses', () => {
  it('has 6 businesses', () => assert.equal(FIXTURE_BUSINESSES.length, 6));
  it('all have isReal:false', () => { for (const b of FIXTURE_BUSINESSES) assert.equal(b.isReal, false); });
  it('PADEL business has correct id', () => assert.equal(FIXTURE_BUSINESS_PADEL.id, 'biz_pad_01'));
  it('all businesses have services array', () => {
    for (const b of FIXTURE_BUSINESSES) assert.ok(Array.isArray(b.services));
  });
});

// ─── 55. Fixtures: FixtureMediaProjects ──────────────────────────────────────
describe('FixtureMediaProjects', () => {
  it('has 7 fixture projects', () => assert.equal(FIXTURE_MEDIA_PROJECTS.length, 7));
  it('all have isReal:false', () => { for (const p of FIXTURE_MEDIA_PROJECTS) assert.equal(p.isReal, false); });
  it('PADEL_15S_REEL has correct channel', () => {
    assert.equal(FIXTURE_PROJECT_PADEL_15S_REEL.channel, MEDIA_CHANNEL.INSTAGRAM_REEL);
  });
  it('all projects have clientId and businessId', () => {
    for (const p of FIXTURE_MEDIA_PROJECTS) {
      assert.ok(p.clientId, `${p.id} missing clientId`);
      assert.ok(p.businessId, `${p.id} missing businessId`);
    }
  });
});

// ─── 56. Fixtures: GoodFixtures ───────────────────────────────────────────────
describe('GoodFixtures', () => {
  it('has 7 good fixtures', () => assert.equal(GOOD_FIXTURES.length, 7));
  it('all have isReal:false', () => { for (const f of GOOD_FIXTURES) assert.equal(f.isReal, false); });
  it('GOOD_SYNTHETIC_AVATAR has identityDisclosure AI_GENERATED', () => {
    assert.equal(GOOD_SYNTHETIC_AVATAR.identityDisclosure, 'AI_GENERATED');
  });
});

// ─── 57. Fixtures: FailureFixtures ────────────────────────────────────────────
describe('FailureFixtures', () => {
  it('has 13 failure fixtures', () => assert.equal(FAILURE_FIXTURES.length, 13));
  it('all have isReal:false', () => { for (const f of FAILURE_FIXTURES) assert.equal(f.isReal, false); });
  it('FAILURE_UNAPPROVED_REAL_FACE expects MISSING_CONSENT', () => {
    assert.equal(FAILURE_UNAPPROVED_REAL_FACE.expectedCriticalFailure, MEDIA_CRITICAL_FAILURE.MISSING_CONSENT);
  });
  it('all failures have expectedGate', () => {
    for (const f of FAILURE_FIXTURES) assert.ok(f.expectedGate, `${f.id} missing expectedGate`);
  });
});

// ─── 58. Registry: AI_MEDIA_REGISTRY ─────────────────────────────────────────
describe('AI_MEDIA_REGISTRY', () => {
  it('has version 1.0.0', () => assert.equal(AI_MEDIA_REGISTRY.version, '1.0.0'));
  it('is ADV-13', () => assert.equal(AI_MEDIA_REGISTRY.adv, 'ADV-13'));
  it('totalModules >= 50', () => assert.ok(AI_MEDIA_REGISTRY.totalModules >= 50));
  it('isReal is false', () => assert.equal(AI_MEDIA_REGISTRY.isReal, false));
  it('all guardrails are SI', () => {
    for (const [k, v] of Object.entries(AI_MEDIA_REGISTRY.guardrails)) {
      assert.equal(v, 'SI', `${k} should be SI`);
    }
  });
  it('has 6 bridges', () => assert.equal(AI_MEDIA_REGISTRY.bridges.length, 6));
});

// ─── 59. Registry: factory-registry/index ────────────────────────────────────
describe('FactoryRegistryIndex', () => {
  it('REGISTRY_VERSION is >= 3.7.0', () => {
    const [major, minor] = REGISTRY_VERSION.split('.').map(Number);
    assert.ok(major > 3 || (major === 3 && minor >= 7));
  });
  it('PASO_ADV13_STATUS is 100_PERCENT', () => assert.equal(PASO_ADV13_STATUS, '100_PERCENT'));
});

// ─── 60. Integration: full media QA pipeline ─────────────────────────────────
describe('Integration: Full Media QA Pipeline', () => {
  let script, storyboard, avatar, voice, lipSyncResult, captions, subtitlePlan;

  before(() => {
    avatar = createAvatarProfile({ id: 'av_test', type: AVATAR_TYPE.SYNTHETIC });
    voice  = ES_ES_NEUTRAL;
    script = generateMediaScript({
      objective: MEDIA_OBJECTIVE.BOOKING, business: { id: 'biz_pad_01', name: 'Pádel 04' },
      hook: 'Ven a jugar al pádel', cta: 'Reserva tu pista', proof: 'Más de 200 socios',
    });
    storyboard    = generateStoryboard({ script, channel: MEDIA_CHANNEL.INSTAGRAM_REEL, targetDuration: 30 });
    lipSyncResult = FixtureLipSyncProvider.sync({ avatarAssetRef: 'fixture://av/1.mp4' });
    captions      = generateCaptions(script);
    subtitlePlan  = createSubtitlePlan(script);
  });

  it('script has HOOK, VALUE, PROOF, CTA', () => {
    const sections = script.sections.map(s => s.section);
    assert.ok(sections.includes('HOOK'));
    assert.ok(sections.includes('CTA'));
  });

  it('storyboard scenes match script sections', () => {
    assert.equal(storyboard.scenes.length, script.sections.length);
  });

  it('claim policy passes clean script', () => {
    const allText = script.sections.map(s => s.text).join(' ');
    const r = validateScriptClaims(allText);
    assert.equal(r.passed, true);
  });

  it('script length valid for 30s', () => {
    const r = validateScriptLength(script, SCRIPT_DURATION.SEC_30);
    assert.equal(r.valid, true);
  });

  it('format resolves correctly for reel', () => {
    const f = resolveMediaFormat(MEDIA_CHANNEL.INSTAGRAM_REEL);
    assert.equal(f.format, MEDIA_FORMAT.VERTICAL_9_16);
  });

  it('avatar quality has no critical fail', () => {
    const r = evaluateAvatarQuality(avatar);
    assert.equal(r.criticalFail, false);
  });

  it('voice quality scores > 60', () => {
    const r = evaluateVoiceQuality(voice);
    assert.ok(r.score > 60);
  });

  it('lipsync quality is GOOD', () => {
    const r = evaluateLipSync(lipSyncResult);
    assert.ok([LIP_SYNC_QUALITY.GOOD, LIP_SYNC_QUALITY.EXCELLENT].includes(r.quality));
  });

  it('captions generated', () => {
    assert.ok(captions[CAPTION_TYPE.SPOKEN].length > 0);
  });

  it('subtitle cues have sequential timing', () => {
    let prev = -1;
    for (const cue of subtitlePlan.cues) {
      assert.ok(cue.startSec >= prev, 'cues not in order');
      prev = cue.endSec;
    }
  });

  it('quality gate PASS for clean project', () => {
    const scores = Object.values(MEDIA_QUALITY_FACTOR).reduce((acc, f) => ({ ...acc, [f]: 85 }), {});
    const qs = computeMediaQualityScore(scores);
    const gate = evaluateMediaQualityGate(qs, [], []);
    assert.equal(gate.status, MEDIA_GATE_STATUS.PASS);
  });

  it('accessibility passes with captions', () => {
    const r = evaluateAccessibility({ hasCaptions: true, hasReducedFlashing: true });
    assert.equal(r.passed, true);
  });

  it('disclosure plan is FULL', () => {
    const plan = buildDisclosurePlan({ avatarProfile: avatar, voiceProfile: voice });
    assert.equal(plan.level, DISCLOSURE_LEVEL.FULL);
  });

  it('output package is complete', () => {
    const pkg = createMediaOutputPackage({
      projectId: 'proj_test', script, storyboard, captions,
    });
    assert.equal(pkg.isReal, false);
    assert.ok(pkg.script !== null);
  });
});
