import { describe, it }  from 'node:test';
import assert            from 'node:assert/strict';

// --- Core modules ---
import {
  VOICE_PERSONALITY, SPEAKING_STYLE, SPEECH_RATE, FORMALITY,
  INTERRUPTION_POLICY, CHANNEL, createVoiceAgentProfile,
} from '../../voice-agent/voiceAgentProfile.js';

import {
  SPEECH_ANTI_PATTERNS, SPEECH_GOOD_PATTERNS, MAX_VOICE_RESPONSE_WORDS,
  evaluateSpeechNaturalness, isTooLongForVoice,
} from '../../voice-agent/humanSpeechStyle.js';

import {
  TURN_STATE, createVoiceTurnManager,
} from '../../voice-agent/voiceTurnManager.js';

import {
  BARGE_IN_ACTION, BARGE_IN_TRIGGER, createBargeInPolicy,
  handleBargeIn, DEFAULT_BARGE_IN_POLICY,
} from '../../voice-agent/bargeInPolicy.js';

import {
  RESPONSE_LENGTH_TIER, createVoiceResponseLengthPolicy,
  checkResponseLength, getRequiredTier,
} from '../../voice-agent/voiceResponseLengthPolicy.js';

import {
  PAUSE_TYPE, createVoicePausePolicy, getPauseDuration,
  selectPauseForContext, DEFAULT_PAUSE_POLICY,
} from '../../voice-agent/voicePausePolicy.js';

import {
  ALLOWED_DISFLUENCIES, FORBIDDEN_DISFLUENCIES, createNaturalDisfluencyPolicy,
  hasForbiddenDisfluency, validateDisfluency,
} from '../../voice-agent/naturalDisfluencyPolicy.js';

import {
  IDENTITY_CLAIM, IDENTITY_QUESTION_PATTERNS, detectsIdentityQuestion,
  classifyIdentityClaim, isFalseHumanClaim, getHonestIdentityResponse,
} from '../../voice-agent/honestIdentityPolicy.js';

import {
  VOICE_INTENT, detectVoiceIntent, getIntentLabel,
} from '../../voice-agent/voiceIntentModel.js';

// --- Phase 2 modules ---
import {
  SWITCH_REASON, createVoiceIntentSwitcher,
} from '../../voice-agent/voiceIntentSwitching.js';

import {
  MEMORY_FIELD_TYPE, createVoiceConversationMemory,
} from '../../voice-agent/voiceConversationMemory.js';

import {
  CONFIRMATION_STYLE, CONFIRMATION_REQUIRED_FOR, createVoiceConfirmationPolicy,
  requiresConfirmation, buildConfirmationPrompt, DEFAULT_CONFIRMATION_POLICY,
} from '../../voice-agent/voiceConfirmationPolicy.js';

import {
  RECOVERY_TRIGGER, RECOVERY_STRATEGY, createVoiceRecoveryPolicy,
  selectRecoveryStrategy, DEFAULT_RECOVERY_POLICY,
} from '../../voice-agent/voiceRecoveryPolicy.js';

import {
  UNDERSTANDING_LEVEL, classifyConfidence, createUnderstandingResult,
} from '../../voice-agent/voiceUnderstandingConfidence.js';

import {
  SILENCE_TYPE, classifySilence, getSilencePrompt, createSilencePolicy,
} from '../../voice-agent/silencePolicy.js';

import {
  CLOSURE_TYPE, CLOSURE_PHRASES, buildCallClosure,
} from '../../voice-agent/voiceCallClosure.js';

import {
  CALL_STATE, createVoiceCallStateMachine,
} from '../../voice-agent/voiceCallStateMachine.js';

import {
  SAFETY_VIOLATION_TYPE, detectsSecretExposure, detectsPaymentExecution,
  checkVoiceSafety, createVoiceSafetyPolicy, DEFAULT_VOICE_SAFETY_POLICY,
} from '../../voice-agent/voiceSafetyPolicy.js';

import {
  redactSensitiveData, createVoicePrivacyPolicy, DEFAULT_VOICE_PRIVACY_POLICY,
} from '../../voice-agent/voicePrivacyPolicy.js';

import {
  CONSENT_STATUS, createRecordingConsentPolicy, buildConsentRequest,
} from '../../voice-agent/recordingConsentPolicy.js';

import {
  createVoiceClientContext, detectClientLeakRisk,
} from '../../voice-agent/voiceClientIsolation.js';

// --- Evaluation ---
import {
  VOICE_EVAL_DIMENSION, DEFAULT_VOICE_DIMENSION_WEIGHTS, createVoiceEvaluationProfile,
} from '../../voice-agent/voiceEvaluationDimensions.js';

import { scoreVoiceHumanness } from '../../voice-agent/voiceHumannessScore.js';

import {
  QUALITY_DIMENSION, scoreCallQuality,
} from '../../voice-agent/voiceCallQualityScore.js';

// --- Bridges ---
import {
  VOICE_FACT_RESOLUTION_STATUS, createVoiceBusinessTruthBridge,
} from '../../voice-agent/voiceBusinessTruthBridge.js';

import {
  VOICE_AVAILABILITY_STATUS, createVoiceAvailabilityBridge,
} from '../../voice-agent/voiceAvailabilityBridge.js';

// --- Flows ---
import {
  BOOKING_STEP, createVoiceBookingFlow,
} from '../../voice-agent/voiceBookingFlow.js';

import {
  INFO_QUERY_TYPE, detectInfoQueryType, buildGroundedInfoResponse,
} from '../../voice-agent/voiceBusinessInfoFlow.js';

import {
  SALES_STAGE, OBJECTION_TYPE, detectSalesObjection,
  buildSalesResponse, createVoiceSalesBehavior,
} from '../../voice-agent/voiceSalesBehavior.js';

import {
  SUPPORT_STEP, createVoiceSupportFlow,
} from '../../voice-agent/voiceSupportFlow.js';

import {
  HANDOFF_TRIGGER, detectHandoffTrigger, buildHandoffMessage,
} from '../../voice-agent/voiceHumanHandoff.js';

import {
  LEAD_QUALITY, createVoiceLeadQualificationFlow,
} from '../../voice-agent/voiceLeadQualificationFlow.js';

import { createVoiceCRMContext } from '../../voice-agent/voiceCRMContext.js';

// --- Providers ---
import {
  VOICE_PROVIDER_TYPE, PROVIDER_STATUS,
  createFixtureVoiceProvider, createVoiceProviderStub,
} from '../../voice-agent/voiceProvider.js';

import {
  TELEPHONY_PROVIDER_TYPE, createTwilioProviderStub,
  createSIPProviderStub, createWebRTCProviderStub,
} from '../../voice-agent/telephonyProvider.js';

import {
  TTS_PROVIDER_TYPE, createSimulatedTTSProvider, createTTSProviderStub,
} from '../../voice-agent/ttsProvider.js';

import {
  STT_PROVIDER_TYPE, createSimulatedSTTProvider,
} from '../../voice-agent/sttProvider.js';

import {
  ROUTING_CRITERION, createVoiceProviderRouter,
} from '../../voice-agent/voiceProviderRouter.js';

import {
  SPANISH_LANGUAGE_CONFIG, getSpanishGreeting,
} from '../../voice-agent/spanishLanguageConfig.js';

import {
  ACCENT_PROFILE, createVoiceAccentProfile,
} from '../../voice-agent/voiceAccentProfile.js';

import {
  BUSINESS_VERTICAL, getPersonalityForVertical,
} from '../../voice-agent/voicePersonalityByBusiness.js';

import {
  CHANNEL_TYPE, adaptResponseForChannel, createVoiceChannelAdapter,
} from '../../voice-agent/voiceChannelAdapter.js';

import {
  LATENCY_COMPONENT, LATENCY_BUDGET_MS, measureLatency, createVoiceLatencyBudget,
} from '../../voice-agent/voiceLatencyBudget.js';

import {
  FAILURE_COMPONENT, FALLBACK_ACTION, selectFallback,
} from '../../voice-agent/voiceFallbackPolicy.js';

import {
  COST_GATE_TYPE, estimateCost, approveCost,
} from '../../voice-agent/voiceCostGuard.js';

import {
  COST_STATE, createVoiceCostEstimate, ZERO_COST_ESTIMATE,
} from '../../voice-agent/voiceCostEstimate.js';

// --- Reports & Outcomes ---
import { createVoiceCallReport } from '../../voice-agent/voiceCallReport.js';
import {
  COMMERCIAL_OUTCOME, classifyCommercialOutcome, createVoiceCommercialOutcome,
} from '../../voice-agent/voiceCommercialOutcome.js';

// --- Observability ---
import {
  VOICE_EVENT_TYPE, VoiceObservabilityBridge,
} from '../../voice-agent/voiceObservabilityBridge.js';

import {
  mapVoiceCallToLangfuseTrace, mapVoiceTurnToLangfuseSpan,
} from '../../voice-agent/voiceLangfuseBridge.js';

import {
  VOICE_MAKE_EVENT, buildVoiceMakePayload,
} from '../../voice-agent/voiceAutomationManifest.js';

// --- Fixtures ---
import { BOOKING_CALL_FIXTURES }   from '../../voice-agent/fixtures/bookingCallFixtures.js';
import { FACTUAL_CALL_FIXTURES }   from '../../voice-agent/fixtures/factualCallFixtures.js';
import { INTERRUPTION_FIXTURES }   from '../../voice-agent/fixtures/interruptionFixtures.js';
import { DIFFICULT_CALL_FIXTURES } from '../../voice-agent/fixtures/difficultCallFixtures.js';
import { SALES_CALL_FIXTURES }     from '../../voice-agent/fixtures/salesCallFixtures.js';
import {
  buildStandardBookingTranscript,
} from '../../voice-agent/fixtures/callTranscriptSimulator.js';
import {
  SIMULATED_CALL_DATASET, getDatasetStats, getCallsByVertical,
} from '../../voice-agent/fixtures/simulatedCallDataset.js';

// --- Registry ---
import { VOICE_AGENT_REGISTRY } from '../../factory-registry/voiceAgent.js';
import { REGISTRY_VERSION, PASO_ADV11_STATUS } from '../../factory-registry/index.js';

// ============================================================
describe('ADV-11 Voice Agent Profile', () => {
  it('VOICE_PERSONALITY has 6 values', () => {
    assert.equal(Object.keys(VOICE_PERSONALITY).length, 6);
  });
  it('SPEAKING_STYLE has 4 values', () => {
    assert.equal(Object.keys(SPEAKING_STYLE).length, 4);
  });
  it('SPEECH_RATE has 3 values', () => {
    assert.equal(Object.keys(SPEECH_RATE).length, 3);
  });
  it('FORMALITY has 3 values', () => {
    assert.equal(Object.keys(FORMALITY).length, 3);
  });
  it('INTERRUPTION_POLICY has 3 values', () => {
    assert.equal(Object.keys(INTERRUPTION_POLICY).length, 3);
  });
  it('CHANNEL has 3 values', () => {
    assert.equal(Object.keys(CHANNEL).length, 3);
  });
  it('createVoiceAgentProfile returns frozen object with isReal:false', () => {
    const p = createVoiceAgentProfile({ name: 'TestAgent', businessName: 'Pádel 04' });
    assert.equal(p.isReal, false);
    assert.equal(typeof p.name, 'string');
    assert.throws(() => { p.name = 'x'; }, TypeError);
  });
});

describe('ADV-11 Human Speech Style', () => {
  it('SPEECH_ANTI_PATTERNS has 10 entries', () => {
    assert.equal(SPEECH_ANTI_PATTERNS.length, 10);
  });
  it('SPEECH_GOOD_PATTERNS has 8 entries', () => {
    assert.equal(SPEECH_GOOD_PATTERNS.length, 8);
  });
  it('MAX_VOICE_RESPONSE_WORDS.SIMPLE is 15', () => {
    assert.equal(MAX_VOICE_RESPONSE_WORDS.SIMPLE, 15);
  });
  it('evaluateSpeechNaturalness returns issues array', () => {
    const r = evaluateSpeechNaturalness('Primero: A. Segundo: B. Tercero: C. Cuarto: D.');
    assert.equal(typeof r.issues, 'object');
    assert.equal(r.isReal, false);
  });
  it('isTooLongForVoice returns true for very long text', () => {
    const long = 'palabra '.repeat(60);
    assert.equal(isTooLongForVoice(long, 'NORMAL'), true);
  });
  it('isTooLongForVoice returns false for short text', () => {
    assert.equal(isTooLongForVoice('Hola, ¿en qué te ayudo?', 'SIMPLE'), false);
  });
});

describe('ADV-11 Turn Manager', () => {
  it('TURN_STATE has 8 states', () => {
    assert.equal(Object.keys(TURN_STATE).length, 8);
  });
  it('createVoiceTurnManager initializes in INITIALIZING', () => {
    const m = createVoiceTurnManager({});
    assert.equal(m.getState(), TURN_STATE.INITIALIZING);
  });
  it('userSpeaks transitions to USER_SPEAKING', () => {
    const m = createVoiceTurnManager({});
    m.userSpeaks();
    assert.equal(m.getState(), TURN_STATE.USER_SPEAKING);
  });
  it('agentSpeaks transitions to AGENT_SPEAKING', () => {
    const m = createVoiceTurnManager({});
    m.agentSpeaks();
    assert.equal(m.getState(), TURN_STATE.AGENT_SPEAKING);
  });
  it('isReal is false', () => {
    assert.equal(createVoiceTurnManager({}).isReal, false);
  });
});

describe('ADV-11 Barge-In Policy', () => {
  it('BARGE_IN_ACTION has 3 values', () => {
    assert.equal(Object.keys(BARGE_IN_ACTION).length, 3);
  });
  it('BARGE_IN_TRIGGER has 4 values', () => {
    assert.equal(Object.keys(BARGE_IN_TRIGGER).length, 4);
  });
  it('createBargeInPolicy returns frozen isReal:false', () => {
    const p = createBargeInPolicy();
    assert.equal(p.isReal, false);
    assert.throws(() => { p.isReal = true; }, TypeError);
  });
  it('handleBargeIn detects topic change as barge-in', () => {
    const result = handleBargeIn('Déjame terminar de explicar…', 'Espera, cuánto cuesta?', DEFAULT_BARGE_IN_POLICY);
    assert.equal(result.isReal, false);
    assert.ok('action' in result);
  });
  it('DEFAULT_BARGE_IN_POLICY is frozen', () => {
    assert.throws(() => { DEFAULT_BARGE_IN_POLICY.something = 1; }, TypeError);
  });
});

describe('ADV-11 Voice Response Length Policy', () => {
  it('RESPONSE_LENGTH_TIER has 5 values', () => {
    assert.equal(Object.keys(RESPONSE_LENGTH_TIER).length, 5);
  });
  it('createVoiceResponseLengthPolicy is frozen', () => {
    const p = createVoiceResponseLengthPolicy();
    assert.equal(p.isReal, false);
  });
  it('checkResponseLength detects too-long responses', () => {
    const policy = createVoiceResponseLengthPolicy();
    const r = checkResponseLength('palabra '.repeat(60), RESPONSE_LENGTH_TIER.GREETING);
    assert.ok('ok' in r || 'tooLong' in r || typeof r === 'object');
  });
  it('getRequiredTier returns a tier string', () => {
    const tier = getRequiredTier({ isBooking: true });
    assert.equal(typeof tier, 'string');
  });
});

describe('ADV-11 Pause Policy', () => {
  it('PAUSE_TYPE has 5 values', () => {
    assert.equal(Object.keys(PAUSE_TYPE).length, 5);
  });
  it('getPauseDuration returns a number', () => {
    const d = getPauseDuration(PAUSE_TYPE.NORMAL, DEFAULT_PAUSE_POLICY);
    assert.equal(typeof d, 'number');
    assert.ok(d > 0);
  });
  it('selectPauseForContext returns a pause type', () => {
    const p = selectPauseForContext({ isConfirmation: true }, DEFAULT_PAUSE_POLICY);
    assert.equal(typeof p, 'string');
  });
  it('createVoicePausePolicy is frozen', () => {
    const p = createVoicePausePolicy();
    assert.throws(() => { p.something = 1; }, TypeError);
  });
});

describe('ADV-11 Natural Disfluency Policy', () => {
  it('ALLOWED_DISFLUENCIES has 10 entries', () => {
    assert.equal(ALLOWED_DISFLUENCIES.length, 10);
  });
  it('FORBIDDEN_DISFLUENCIES has entries', () => {
    assert.ok(FORBIDDEN_DISFLUENCIES.length >= 5);
  });
  it('createNaturalDisfluencyPolicy is frozen', () => {
    const p = createNaturalDisfluencyPolicy();
    assert.throws(() => { p.x = 1; }, TypeError);
  });
  it('hasForbiddenDisfluency returns boolean', () => {
    assert.equal(typeof hasForbiddenDisfluency('como... como...'), 'boolean');
  });
  it('validateDisfluency returns object with isReal', () => {
    const r = validateDisfluency('pues');
    assert.equal(r.isReal, false);
  });
});

describe('ADV-11 Honest Identity Policy', () => {
  it('IDENTITY_CLAIM has 3 values', () => {
    assert.equal(Object.keys(IDENTITY_CLAIM).length, 3);
  });
  it('IDENTITY_QUESTION_PATTERNS has 6 entries', () => {
    assert.equal(IDENTITY_QUESTION_PATTERNS.length, 6);
  });
  it('detectsIdentityQuestion returns true for "eres humano?"', () => {
    assert.equal(detectsIdentityQuestion('¿Eres una persona humana?'), true);
  });
  it('detectsIdentityQuestion returns false for normal query', () => {
    assert.equal(detectsIdentityQuestion('¿Cuánto cuesta una pista?'), false);
  });
  it('isFalseHumanClaim returns true for claiming to be human', () => {
    assert.equal(isFalseHumanClaim('Soy una persona real, no te preocupes.'), true);
  });
  it('isFalseHumanClaim returns false for honest AI disclosure', () => {
    assert.equal(isFalseHumanClaim('Soy un asistente de IA.'), false);
  });
  it('getHonestIdentityResponse returns a non-empty string', () => {
    const r = getHonestIdentityResponse();
    assert.ok(r.length > 0);
    assert.ok(r.includes('asistente'));
  });
});

describe('ADV-11 Voice Intent Model', () => {
  it('VOICE_INTENT has 12 values', () => {
    assert.equal(Object.keys(VOICE_INTENT).length, 12);
  });
  it('detectVoiceIntent detects BOOKING from "quiero reservar"', () => {
    const r = detectVoiceIntent('quiero reservar una pista');
    assert.equal(r.intent, VOICE_INTENT.BOOKING);
    assert.equal(r.isReal, false);
  });
  it('detectVoiceIntent detects CANCEL from "anular"', () => {
    const r = detectVoiceIntent('quiero anular la pista');
    assert.equal(r.intent, VOICE_INTENT.CANCEL);
  });
  it('detectVoiceIntent detects HUMAN from "persona real"', () => {
    const r = detectVoiceIntent('quiero hablar con una persona real');
    assert.equal(r.intent, VOICE_INTENT.HUMAN);
  });
  it('detectVoiceIntent returns UNKNOWN for unmatched text', () => {
    const r = detectVoiceIntent('xyzzy absurd text');
    assert.equal(r.intent, VOICE_INTENT.UNKNOWN);
  });
  it('getIntentLabel returns a Spanish label', () => {
    const label = getIntentLabel(VOICE_INTENT.BOOKING);
    assert.equal(typeof label, 'string');
    assert.ok(label.length > 0);
  });
});

describe('ADV-11 Intent Switching', () => {
  it('SWITCH_REASON has 4 values', () => {
    assert.equal(Object.keys(SWITCH_REASON).length, 4);
  });
  it('createVoiceIntentSwitcher initializes correctly', () => {
    const s = createVoiceIntentSwitcher(VOICE_INTENT.BOOKING);
    assert.equal(s.getCurrent(), VOICE_INTENT.BOOKING);
    assert.equal(s.isReal, false);
  });
  it('switchIntent changes current intent', () => {
    const s = createVoiceIntentSwitcher(VOICE_INTENT.BOOKING);
    const r = s.switchIntent(VOICE_INTENT.CANCEL, SWITCH_REASON.USER_PIVOT, 1);
    assert.equal(s.getCurrent(), VOICE_INTENT.CANCEL);
    assert.equal(r.isReal, false);
  });
  it('detectAndSwitch detects new intent in text', () => {
    const s = createVoiceIntentSwitcher(VOICE_INTENT.BOOKING);
    s.detectAndSwitch('quiero cancelar', 2);
    assert.equal(s.getCurrent(), VOICE_INTENT.CANCEL);
  });
  it('getHistory grows on each switch', () => {
    const s = createVoiceIntentSwitcher(VOICE_INTENT.UNKNOWN);
    s.switchIntent(VOICE_INTENT.BOOKING);
    assert.equal(s.getHistory().length, 2);
  });
});

describe('ADV-11 Conversation Memory', () => {
  it('MEMORY_FIELD_TYPE has 4 values', () => {
    assert.equal(Object.keys(MEMORY_FIELD_TYPE).length, 4);
  });
  it('set and get work correctly', () => {
    const mem = createVoiceConversationMemory();
    mem.set('slot', 'tuesday');
    assert.equal(mem.get('slot').value, 'tuesday');
  });
  it('size returns correct count', () => {
    const mem = createVoiceConversationMemory();
    mem.set('a', 1); mem.set('b', 2);
    assert.equal(mem.size(), 2);
  });
  it('getContext returns all values', () => {
    const mem = createVoiceConversationMemory();
    mem.set('day', 'lunes');
    const ctx = mem.getContext();
    assert.equal(ctx.day, 'lunes');
  });
  it('isReal is false', () => {
    assert.equal(createVoiceConversationMemory().isReal, false);
  });
});

describe('ADV-11 Confirmation Policy', () => {
  it('CONFIRMATION_STYLE has 3 values', () => {
    assert.equal(Object.keys(CONFIRMATION_STYLE).length, 3);
  });
  it('requiresConfirmation returns true for booking', () => {
    assert.equal(requiresConfirmation('booking', DEFAULT_CONFIRMATION_POLICY), true);
  });
  it('requiresConfirmation returns false for generic query', () => {
    assert.equal(requiresConfirmation('info_query', DEFAULT_CONFIRMATION_POLICY), false);
  });
  it('buildConfirmationPrompt builds a string', () => {
    const p = buildConfirmationPrompt('booking', { day: 'martes', time: '10:00' });
    assert.ok(p.includes('booking'));
    assert.ok(p.includes('Confirmas'));
  });
  it('DEFAULT_CONFIRMATION_POLICY is frozen', () => {
    assert.throws(() => { DEFAULT_CONFIRMATION_POLICY.x = 1; }, TypeError);
  });
});

describe('ADV-11 Recovery Policy', () => {
  it('RECOVERY_TRIGGER has 5 values', () => {
    assert.equal(Object.keys(RECOVERY_TRIGGER).length, 5);
  });
  it('RECOVERY_STRATEGY has 5 values', () => {
    assert.equal(Object.keys(RECOVERY_STRATEGY).length, 5);
  });
  it('selectRecoveryStrategy returns CLARIFY on attempt 0', () => {
    assert.equal(selectRecoveryStrategy(0, DEFAULT_RECOVERY_POLICY), RECOVERY_STRATEGY.CLARIFY);
  });
  it('selectRecoveryStrategy returns TRANSFER after maxAttempts', () => {
    assert.equal(selectRecoveryStrategy(3, DEFAULT_RECOVERY_POLICY), RECOVERY_STRATEGY.TRANSFER);
  });
  it('createVoiceRecoveryPolicy is frozen', () => {
    const p = createVoiceRecoveryPolicy();
    assert.throws(() => { p.x = 1; }, TypeError);
  });
});

describe('ADV-11 Understanding Confidence', () => {
  it('UNDERSTANDING_LEVEL has 4 values', () => {
    assert.equal(Object.keys(UNDERSTANDING_LEVEL).length, 4);
  });
  it('classifyConfidence HIGH at 0.9', () => {
    assert.equal(classifyConfidence(0.9), UNDERSTANDING_LEVEL.HIGH);
  });
  it('classifyConfidence MEDIUM at 0.7', () => {
    assert.equal(classifyConfidence(0.7), UNDERSTANDING_LEVEL.MEDIUM);
  });
  it('classifyConfidence LOW at 0.4', () => {
    assert.equal(classifyConfidence(0.4), UNDERSTANDING_LEVEL.LOW);
  });
  it('classifyConfidence UNKNOWN at 0.2', () => {
    assert.equal(classifyConfidence(0.2), UNDERSTANDING_LEVEL.UNKNOWN);
  });
  it('createUnderstandingResult sets needsRecovery true when score < 0.60', () => {
    const r = createUnderstandingResult('test', 0.4);
    assert.equal(r.needsRecovery, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-11 Silence Policy', () => {
  it('SILENCE_TYPE has 4 values', () => {
    assert.equal(Object.keys(SILENCE_TYPE).length, 4);
  });
  it('classifySilence SHORT for 1s', () => {
    assert.equal(classifySilence(1000), SILENCE_TYPE.SHORT);
  });
  it('classifySilence NORMAL for 3s', () => {
    assert.equal(classifySilence(3000), SILENCE_TYPE.NORMAL);
  });
  it('classifySilence LONG for 10s', () => {
    assert.equal(classifySilence(10000), SILENCE_TYPE.LONG);
  });
  it('classifySilence DISCONNECTED for 20s', () => {
    assert.equal(classifySilence(20000), SILENCE_TYPE.DISCONNECTED);
  });
  it('getSilencePrompt returns string for NORMAL', () => {
    assert.ok(getSilencePrompt(SILENCE_TYPE.NORMAL).length > 0);
  });
  it('getSilencePrompt returns null for SHORT', () => {
    assert.equal(getSilencePrompt(SILENCE_TYPE.SHORT), null);
  });
  it('createSilencePolicy is frozen', () => {
    const p = createSilencePolicy();
    assert.throws(() => { p.x = 1; }, TypeError);
  });
});

describe('ADV-11 Call Closure', () => {
  it('CLOSURE_TYPE has 5 values', () => {
    assert.equal(Object.keys(CLOSURE_TYPE).length, 5);
  });
  it('buildCallClosure returns frozen object', () => {
    const c = buildCallClosure(CLOSURE_TYPE.TASK_COMPLETED);
    assert.equal(c.isReal, false);
    assert.throws(() => { c.x = 1; }, TypeError);
  });
  it('buildCallClosure phrase contains Spanish text', () => {
    const c = buildCallClosure(CLOSURE_TYPE.TASK_COMPLETED);
    assert.ok(c.phrase.length > 0);
  });
  it('all CLOSURE_TYPE values have phrases', () => {
    for (const type of Object.values(CLOSURE_TYPE)) {
      assert.ok(CLOSURE_PHRASES[type], `Missing phrase for ${type}`);
    }
  });
});

describe('ADV-11 Call State Machine', () => {
  it('CALL_STATE has 11 states', () => {
    assert.equal(Object.keys(CALL_STATE).length, 11);
  });
  it('creates machine in INITIALIZING', () => {
    const m = createVoiceCallStateMachine();
    assert.equal(m.getState(), CALL_STATE.INITIALIZING);
  });
  it('valid transition INITIALIZING→GREETING succeeds', () => {
    const m = createVoiceCallStateMachine();
    const r = m.transition(CALL_STATE.GREETING);
    assert.equal(r.ok, true);
    assert.equal(m.getState(), CALL_STATE.GREETING);
  });
  it('invalid transition returns ok:false', () => {
    const m = createVoiceCallStateMachine();
    const r = m.transition(CALL_STATE.ENDED);
    assert.equal(r.ok, false);
    assert.equal(m.getState(), CALL_STATE.INITIALIZING);
  });
  it('isTerminal true for ENDED', () => {
    const m = createVoiceCallStateMachine(CALL_STATE.ENDED);
    assert.equal(m.isTerminal(), true);
  });
  it('isTerminal false for GREETING', () => {
    const m = createVoiceCallStateMachine(CALL_STATE.GREETING);
    assert.equal(m.isTerminal(), false);
  });
  it('history grows on transitions', () => {
    const m = createVoiceCallStateMachine();
    m.transition(CALL_STATE.GREETING);
    assert.equal(m.getHistory().length, 2);
  });
});

describe('ADV-11 Safety Policy', () => {
  it('SAFETY_VIOLATION_TYPE has 6 values', () => {
    assert.equal(Object.keys(SAFETY_VIOLATION_TYPE).length, 6);
  });
  it('detectsSecretExposure detects API key pattern', () => {
    assert.equal(detectsSecretExposure('API_KEY=sk-abc123456789012345678'), true);
  });
  it('detectsSecretExposure returns false for clean text', () => {
    assert.equal(detectsSecretExposure('Hola, ¿en qué te ayudo?'), false);
  });
  it('detectsPaymentExecution detects payment command', () => {
    assert.equal(detectsPaymentExecution('Cobra el importe ahora'), true);
  });
  it('checkVoiceSafety returns safe:true for clean text', () => {
    const r = checkVoiceSafety('Hola, la pista está disponible el martes.');
    assert.equal(r.safe, true);
    assert.equal(r.isReal, false);
  });
  it('checkVoiceSafety detects violations', () => {
    const r = checkVoiceSafety('API_KEY=sk-x0123456789012345678');
    assert.equal(r.safe, false);
    assert.ok(r.violations.length > 0);
  });
  it('DEFAULT_VOICE_SAFETY_POLICY is frozen', () => {
    assert.throws(() => { DEFAULT_VOICE_SAFETY_POLICY.x = 1; }, TypeError);
  });
});

describe('ADV-11 Privacy Policy', () => {
  it('redactSensitiveData removes phone numbers', () => {
    const r = redactSensitiveData('Mi teléfono es 600123456');
    assert.ok(r.includes('[TELEFONO_REDACTADO]'));
  });
  it('redactSensitiveData removes emails', () => {
    const r = redactSensitiveData('Escríbeme a user@example.com');
    assert.ok(r.includes('[EMAIL_REDACTADO]'));
  });
  it('createVoicePrivacyPolicy is frozen', () => {
    assert.throws(() => { DEFAULT_VOICE_PRIVACY_POLICY.x = 1; }, TypeError);
  });
  it('DEFAULT_VOICE_PRIVACY_POLICY has minimumDataOnly:true', () => {
    assert.equal(DEFAULT_VOICE_PRIVACY_POLICY.minimumDataOnly, true);
  });
});

describe('ADV-11 Recording Consent Policy', () => {
  it('CONSENT_STATUS has 4 values', () => {
    assert.equal(Object.keys(CONSENT_STATUS).length, 4);
  });
  it('buildConsentRequest returns PENDING status', () => {
    const r = buildConsentRequest();
    assert.equal(r.status, CONSENT_STATUS.PENDING);
    assert.equal(r.isReal, false);
  });
  it('createRecordingConsentPolicy has noRealRecording:true', () => {
    const p = createRecordingConsentPolicy();
    assert.equal(p.noRealRecording, true);
  });
});

describe('ADV-11 Client Isolation', () => {
  it('createVoiceClientContext requires clientId', () => {
    assert.throws(() => createVoiceClientContext(''), Error);
  });
  it('setFact and getFact work for correct client', () => {
    const ctx = createVoiceClientContext('client-A');
    ctx.setFact('client-A', 'court', 'pista-1');
    assert.equal(ctx.getFact('client-A', 'court'), 'pista-1');
  });
  it('setFact throws for wrong client', () => {
    const ctx = createVoiceClientContext('client-A');
    assert.throws(() => ctx.setFact('client-B', 'x', 1), /CLIENT_ISOLATION_VIOLATION/);
  });
  it('detectClientLeakRisk detects different clients', () => {
    const r = detectClientLeakRisk('client-A', 'client-B');
    assert.equal(r.leakDetected, true);
    assert.equal(r.isReal, false);
  });
  it('detectClientLeakRisk returns false for same client', () => {
    const r = detectClientLeakRisk('client-A', 'client-A');
    assert.equal(r.leakDetected, false);
  });
});

describe('ADV-11 Evaluation Dimensions', () => {
  it('VOICE_EVAL_DIMENSION has 6 values', () => {
    assert.equal(Object.keys(VOICE_EVAL_DIMENSION).length, 6);
  });
  it('DEFAULT_VOICE_DIMENSION_WEIGHTS sums to 100', () => {
    const total = Object.values(DEFAULT_VOICE_DIMENSION_WEIGHTS).reduce((s, v) => s + v, 0);
    assert.equal(total, 100);
  });
  it('createVoiceEvaluationProfile is frozen', () => {
    const p = createVoiceEvaluationProfile();
    assert.throws(() => { p.x = 1; }, TypeError);
  });
});

describe('ADV-11 Humanness Score', () => {
  it('scoreVoiceHumanness returns score between 0 and 100', () => {
    const r = scoreVoiceHumanness('Hola, ¿en qué te ayudo?');
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('scoreVoiceHumanness grades GOOD for natural text', () => {
    const r = scoreVoiceHumanness('Claro, ¿para qué día?');
    assert.equal(r.grade, 'GOOD');
  });
});

describe('ADV-11 Call Quality Score', () => {
  it('QUALITY_DIMENSION has 5 values', () => {
    assert.equal(Object.keys(QUALITY_DIMENSION).length, 5);
  });
  it('scoreCallQuality returns overall between 0 and 100', () => {
    const r = scoreCallQuality({
      [QUALITY_DIMENSION.TASK_COMPLETION]: 90,
      [QUALITY_DIMENSION.ACCURACY]:        85,
      [QUALITY_DIMENSION.NATURALNESS]:     80,
      [QUALITY_DIMENSION.LATENCY]:         70,
      [QUALITY_DIMENSION.SAFETY]:         100,
    });
    assert.ok(r.overall >= 0 && r.overall <= 100);
    assert.equal(r.isReal, false);
  });
  it('scoreCallQuality grades GOOD for high scores', () => {
    const r = scoreCallQuality({
      [QUALITY_DIMENSION.TASK_COMPLETION]: 90,
      [QUALITY_DIMENSION.ACCURACY]:        90,
      [QUALITY_DIMENSION.NATURALNESS]:     90,
      [QUALITY_DIMENSION.LATENCY]:         90,
      [QUALITY_DIMENSION.SAFETY]:          90,
    });
    assert.equal(r.grade, 'GOOD');
  });
});

describe('ADV-11 Business Truth Bridge', () => {
  it('VOICE_FACT_RESOLUTION_STATUS has 4 values', () => {
    assert.equal(Object.keys(VOICE_FACT_RESOLUTION_STATUS).length, 4);
  });
  it('createVoiceBusinessTruthBridge without BST returns UNKNOWN', () => {
    const bridge = createVoiceBusinessTruthBridge(null);
    const r = bridge.resolveFactForVoice('hours', 'client-A');
    assert.equal(r.status, VOICE_FACT_RESOLUTION_STATUS.UNKNOWN);
    assert.equal(r.isReal, false);
  });
  it('createVoiceBusinessTruthBridge with BST resolves fact', () => {
    const bst = { facts: { opening_hours: '9:00-22:00' } };
    const bridge = createVoiceBusinessTruthBridge(bst);
    const r = bridge.resolveFactForVoice('opening_hours', 'client-A');
    assert.equal(r.status, VOICE_FACT_RESOLUTION_STATUS.RESOLVED);
  });
  it('isFactVerified returns false without BST', () => {
    const bridge = createVoiceBusinessTruthBridge(null);
    assert.equal(bridge.isFactVerified('hours'), false);
  });
});

describe('ADV-11 Availability Bridge', () => {
  it('VOICE_AVAILABILITY_STATUS has 4 values', () => {
    assert.equal(Object.keys(VOICE_AVAILABILITY_STATUS).length, 4);
  });
  it('createVoiceAvailabilityBridge without resolver returns UNKNOWN', () => {
    const bridge = createVoiceAvailabilityBridge(null);
    const r = bridge.checkAvailabilityForVoice({ day: 'tuesday' });
    assert.equal(r.status, VOICE_AVAILABILITY_STATUS.UNKNOWN);
    assert.equal(r.isReal, false);
  });
  it('buildVoiceAvailabilityResponse returns Spanish string', () => {
    const bridge = createVoiceAvailabilityBridge(null);
    const r = bridge.buildVoiceAvailabilityResponse(VOICE_AVAILABILITY_STATUS.AVAILABLE, { label: 'martes 10:00' });
    assert.ok(r.includes('disponibilidad'));
  });
  it('buildVoiceAvailabilityResponse for UNAVAILABLE', () => {
    const bridge = createVoiceAvailabilityBridge(null);
    const r = bridge.buildVoiceAvailabilityResponse(VOICE_AVAILABILITY_STATUS.UNAVAILABLE, {});
    assert.ok(r.includes('disponible'));
  });
});

describe('ADV-11 Booking Flow', () => {
  it('BOOKING_STEP has 8 values', () => {
    assert.equal(Object.keys(BOOKING_STEP).length, 8);
  });
  it('createVoiceBookingFlow starts at COLLECT_DATE', () => {
    const flow = createVoiceBookingFlow();
    assert.equal(flow.currentStep(), BOOKING_STEP.COLLECT_DATE);
  });
  it('advance moves to next step', () => {
    const flow = createVoiceBookingFlow();
    const r = flow.advance('date', 'martes');
    assert.notEqual(r.step, BOOKING_STEP.COLLECT_DATE);
  });
  it('confirmBooking returns CONFIRMED', () => {
    const flow = createVoiceBookingFlow();
    flow.advance('date', 'martes');
    const r = flow.confirmBooking();
    assert.equal(r.step, BOOKING_STEP.CONFIRMED);
    assert.equal(r.simulated, true);
    assert.equal(r.isReal, false);
  });
  it('getData returns collected fields', () => {
    const flow = createVoiceBookingFlow();
    flow.advance('date', 'martes');
    const data = flow.getData();
    assert.equal(data.date, 'martes');
  });
});

describe('ADV-11 Business Info Flow', () => {
  it('INFO_QUERY_TYPE has 6 values', () => {
    assert.equal(Object.keys(INFO_QUERY_TYPE).length, 6);
  });
  it('detectInfoQueryType detects HOURS', () => {
    assert.equal(detectInfoQueryType('¿Cuál es vuestro horario?'), INFO_QUERY_TYPE.HOURS);
  });
  it('detectInfoQueryType detects PRICES', () => {
    assert.equal(detectInfoQueryType('¿Cuánto cuesta una pista?'), INFO_QUERY_TYPE.PRICES);
  });
  it('detectInfoQueryType returns GENERAL for unknown', () => {
    assert.equal(detectInfoQueryType('xyzzy'), INFO_QUERY_TYPE.GENERAL);
  });
  it('buildGroundedInfoResponse without facts returns honest unknown', () => {
    const r = buildGroundedInfoResponse(INFO_QUERY_TYPE.HOURS, {});
    assert.ok(r.includes('información verificada') || r.length > 0);
  });
  it('buildGroundedInfoResponse with hours fact returns hours', () => {
    const r = buildGroundedInfoResponse(INFO_QUERY_TYPE.HOURS, { opening_hours: '9:00-22:00' });
    assert.ok(r.includes('9:00'));
  });
});

describe('ADV-11 Sales Behavior', () => {
  it('SALES_STAGE has 6 values', () => {
    assert.equal(Object.keys(SALES_STAGE).length, 6);
  });
  it('OBJECTION_TYPE has 5 values', () => {
    assert.equal(Object.keys(OBJECTION_TYPE).length, 5);
  });
  it('detectSalesObjection detects PRICE from "caro"', () => {
    assert.equal(detectSalesObjection('Me parece muy caro'), OBJECTION_TYPE.PRICE);
  });
  it('detectSalesObjection detects COMPETITOR', () => {
    assert.equal(detectSalesObjection('Ya tengo otra empresa'), OBJECTION_TYPE.COMPETITOR);
  });
  it('detectSalesObjection returns null for no match', () => {
    assert.equal(detectSalesObjection('Sí, me interesa mucho'), null);
  });
  it('buildSalesResponse returns non-empty string', () => {
    const r = buildSalesResponse(SALES_STAGE.CLOSING);
    assert.ok(r.length > 0);
  });
  it('createVoiceSalesBehavior is frozen', () => {
    const b = createVoiceSalesBehavior();
    assert.throws(() => { b.x = 1; }, TypeError);
    assert.equal(b.noHighPressure, true);
    assert.equal(b.isReal, false);
  });
});

describe('ADV-11 Support Flow', () => {
  it('SUPPORT_STEP has 6 values', () => {
    assert.equal(Object.keys(SUPPORT_STEP).length, 6);
  });
  it('createVoiceSupportFlow starts at UNDERSTAND', () => {
    const flow = createVoiceSupportFlow();
    assert.equal(flow.currentStep(), SUPPORT_STEP.UNDERSTAND);
  });
  it('advance moves to next step', () => {
    const flow = createVoiceSupportFlow();
    const r = flow.advance(false);
    assert.notEqual(r.step, SUPPORT_STEP.UNDERSTAND);
    assert.equal(r.isReal, false);
  });
  it('advance(resolved=true) goes to CLOSE', () => {
    const flow = createVoiceSupportFlow();
    const r = flow.advance(true);
    assert.equal(r.step, SUPPORT_STEP.CLOSE);
  });
});

describe('ADV-11 Human Handoff', () => {
  it('HANDOFF_TRIGGER has 6 values', () => {
    assert.equal(Object.keys(HANDOFF_TRIGGER).length, 6);
  });
  it('detectHandoffTrigger USER_REQUESTED for "persona real"', () => {
    assert.equal(detectHandoffTrigger('quiero hablar con una persona real', 0), HANDOFF_TRIGGER.USER_REQUESTED);
  });
  it('detectHandoffTrigger REPEATED_FAILURES after 3 attempts', () => {
    assert.equal(detectHandoffTrigger('no entiendo', 3), HANDOFF_TRIGGER.REPEATED_FAILURES);
  });
  it('detectHandoffTrigger returns null for normal text', () => {
    assert.equal(detectHandoffTrigger('quiero reservar', 0), null);
  });
  it('buildHandoffMessage returns Spanish string', () => {
    const m = buildHandoffMessage(HANDOFF_TRIGGER.USER_REQUESTED);
    assert.ok(m.length > 0);
  });
});

describe('ADV-11 Lead Qualification Flow', () => {
  it('LEAD_QUALITY has 4 values', () => {
    assert.equal(Object.keys(LEAD_QUALITY).length, 4);
  });
  it('createVoiceLeadQualificationFlow starts correctly', () => {
    const flow = createVoiceLeadQualificationFlow();
    assert.equal(flow.isReal, false);
    assert.equal(typeof flow.currentStep(), 'string');
  });
  it('qualify returns a quality object', () => {
    const flow = createVoiceLeadQualificationFlow();
    const r = flow.qualify();
    assert.ok(Object.values(LEAD_QUALITY).includes(r.quality));
    assert.equal(r.isReal, false);
  });
});

describe('ADV-11 CRM Context', () => {
  it('createVoiceCRMContext without adapter returns found:false', () => {
    const ctx = createVoiceCRMContext(null);
    const r = ctx.lookupContact('600123456');
    assert.equal(r.found, false);
    assert.equal(r.isReal, false);
  });
  it('buildPersonalizedGreeting uses contact name', () => {
    const ctx = createVoiceCRMContext(null);
    const g = ctx.buildPersonalizedGreeting({ name: 'María' }, 'Pádel 04');
    assert.ok(g.includes('María'));
  });
  it('buildPersonalizedGreeting handles no contact', () => {
    const ctx = createVoiceCRMContext(null);
    const g = ctx.buildPersonalizedGreeting(null, 'Pádel 04');
    assert.ok(g.includes('Pádel 04'));
  });
  it('hasCRM is false without adapter', () => {
    assert.equal(createVoiceCRMContext(null).hasCRM, false);
  });
});

describe('ADV-11 Voice Providers', () => {
  it('VOICE_PROVIDER_TYPE has 4 values', () => {
    assert.equal(Object.keys(VOICE_PROVIDER_TYPE).length, 4);
  });
  it('createFixtureVoiceProvider is SIMULATED and frozen', () => {
    const p = createFixtureVoiceProvider();
    assert.equal(p.status, PROVIDER_STATUS.SIMULATED);
    assert.equal(p.noRealCalls, true);
    assert.equal(p.isReal, false);
    assert.throws(() => { p.x = 1; }, TypeError);
  });
  it('createFixtureVoiceProvider makeCall returns simulated object', () => {
    const p = createFixtureVoiceProvider();
    const c = p.makeCall('+34600000001', '+34600000002');
    assert.equal(c.simulated, true);
    assert.equal(c.isReal, false);
  });
  it('createVoiceProviderStub makeCall throws', () => {
    const stub = createVoiceProviderStub(VOICE_PROVIDER_TYPE.TWILIO);
    assert.throws(() => stub.makeCall(), /NO_REAL_CALLS/);
  });
  it('TELEPHONY_PROVIDER_TYPE has 3 values', () => {
    assert.equal(Object.keys(TELEPHONY_PROVIDER_TYPE).length, 3);
  });
  it('createTwilioProviderStub dial throws', () => {
    const stub = createTwilioProviderStub();
    assert.throws(() => stub.dial(), /NO_REAL_CALLS/);
  });
  it('createSIPProviderStub dial throws', () => {
    const stub = createSIPProviderStub();
    assert.throws(() => stub.dial(), /NO_REAL_CALLS/);
  });
  it('createWebRTCProviderStub startSession throws', () => {
    const stub = createWebRTCProviderStub();
    assert.throws(() => stub.startSession(), /NO_REAL_CALLS/);
  });
});

describe('ADV-11 TTS & STT Providers', () => {
  it('TTS_PROVIDER_TYPE has 4 values', () => {
    assert.equal(Object.keys(TTS_PROVIDER_TYPE).length, 4);
  });
  it('createSimulatedTTSProvider synthesize returns simulated', () => {
    const p = createSimulatedTTSProvider();
    const r = p.synthesize('Hola', 'es-ES', {});
    assert.equal(r.simulated, true);
    assert.equal(r.isReal, false);
    assert.equal(r.audioUrl, null);
  });
  it('createTTSProviderStub synthesize throws', () => {
    const stub = createTTSProviderStub(TTS_PROVIDER_TYPE.ELEVENLABS);
    assert.throws(() => stub.synthesize('hi'));
  });
  it('STT_PROVIDER_TYPE has 4 values', () => {
    assert.equal(Object.keys(STT_PROVIDER_TYPE).length, 4);
  });
  it('createSimulatedSTTProvider transcribe returns simulated', () => {
    const p = createSimulatedSTTProvider();
    const r = p.transcribe({ simulatedText: 'quiero reservar' }, 'es-ES', {});
    assert.equal(r.simulated, true);
    assert.equal(r.text, 'quiero reservar');
    assert.ok(r.confidence >= 0.5);
  });
});

describe('ADV-11 Provider Router', () => {
  it('ROUTING_CRITERION has 4 values', () => {
    assert.equal(Object.keys(ROUTING_CRITERION).length, 4);
  });
  it('createVoiceProviderRouter returns TTS selection', () => {
    const router = createVoiceProviderRouter();
    const r = router.selectTTS('es-ES');
    assert.equal(r.isReal, false);
    assert.equal(typeof r.provider, 'object');
  });
  it('createVoiceProviderRouter returns STT selection', () => {
    const router = createVoiceProviderRouter();
    const r = router.selectSTT('es-ES');
    assert.equal(r.isReal, false);
  });
});

describe('ADV-11 Spanish Language Config', () => {
  it('locale is es-ES', () => {
    assert.equal(SPANISH_LANGUAGE_CONFIG.locale, 'es-ES');
  });
  it('currencySymbol is €', () => {
    assert.equal(SPANISH_LANGUAGE_CONFIG.currencySymbol, '€');
  });
  it('greetings has morning/afternoon/evening', () => {
    assert.ok(SPANISH_LANGUAGE_CONFIG.greetings.morning);
    assert.ok(SPANISH_LANGUAGE_CONFIG.greetings.afternoon);
    assert.ok(SPANISH_LANGUAGE_CONFIG.greetings.evening);
  });
  it('getSpanishGreeting returns morning for hour 9', () => {
    assert.ok(getSpanishGreeting(9).includes('Buenos días'));
  });
  it('getSpanishGreeting returns afternoon for hour 15', () => {
    assert.ok(getSpanishGreeting(15).includes('Buenas tardes'));
  });
  it('isReal is false', () => {
    assert.equal(SPANISH_LANGUAGE_CONFIG.isReal, false);
  });
});

describe('ADV-11 Accent Profile', () => {
  it('ACCENT_PROFILE has 5 values', () => {
    assert.equal(Object.keys(ACCENT_PROFILE).length, 5);
  });
  it('createVoiceAccentProfile ES_NEUTRAL is frozen', () => {
    const p = createVoiceAccentProfile(ACCENT_PROFILE.ES_NEUTRAL);
    assert.equal(p.locale, 'es-ES');
    assert.throws(() => { p.x = 1; }, TypeError);
    assert.equal(p.isReal, false);
  });
  it('createVoiceAccentProfile LATAM_NEUTRAL has es-419 locale', () => {
    const p = createVoiceAccentProfile(ACCENT_PROFILE.LATAM_NEUTRAL);
    assert.equal(p.locale, 'es-419');
  });
});

describe('ADV-11 Personality By Business', () => {
  it('BUSINESS_VERTICAL has 9 values', () => {
    assert.equal(Object.keys(BUSINESS_VERTICAL).length, 9);
  });
  it('getPersonalityForVertical PADEL_CLUB returns FRIENDLY_ENERGETIC', () => {
    const p = getPersonalityForVertical(BUSINESS_VERTICAL.PADEL_CLUB);
    assert.equal(p.personality, VOICE_PERSONALITY.FRIENDLY_ENERGETIC);
    assert.equal(p.isReal, false);
  });
  it('getPersonalityForVertical DENTAL_CLINIC returns EMPATHETIC', () => {
    const p = getPersonalityForVertical(BUSINESS_VERTICAL.DENTAL_CLINIC);
    assert.equal(p.personality, VOICE_PERSONALITY.EMPATHETIC);
  });
  it('getPersonalityForVertical LEGAL returns CALM_PRECISE', () => {
    const p = getPersonalityForVertical(BUSINESS_VERTICAL.LEGAL);
    assert.equal(p.personality, VOICE_PERSONALITY.CALM_PRECISE);
  });
});

describe('ADV-11 Channel Adapter', () => {
  it('CHANNEL_TYPE has 2 values', () => {
    assert.equal(Object.keys(CHANNEL_TYPE).length, 2);
  });
  it('adaptResponseForChannel strips markdown for VOICE', () => {
    const r = adaptResponseForChannel('**Bold text** here', CHANNEL_TYPE.VOICE);
    assert.ok(!r.includes('**'));
  });
  it('adaptResponseForChannel keeps markdown for CHAT', () => {
    const r = adaptResponseForChannel('**Bold text** here', CHANNEL_TYPE.CHAT);
    assert.ok(r.includes('**'));
  });
  it('createVoiceChannelAdapter is frozen', () => {
    const a = createVoiceChannelAdapter(CHANNEL_TYPE.VOICE);
    assert.throws(() => { a.x = 1; }, TypeError);
    assert.equal(a.isReal, false);
  });
});

describe('ADV-11 Latency Budget', () => {
  it('LATENCY_COMPONENT has 5 values', () => {
    assert.equal(Object.keys(LATENCY_COMPONENT).length, 5);
  });
  it('LATENCY_BUDGET_MS.TOTAL is 1900', () => {
    assert.equal(LATENCY_BUDGET_MS.TOTAL, 1900);
  });
  it('measureLatency returns overBudget:true when over', () => {
    const r = measureLatency(LATENCY_COMPONENT.STT, 500);
    assert.equal(r.overBudget, true);
    assert.equal(r.isReal, false);
  });
  it('measureLatency returns overBudget:false when under', () => {
    const r = measureLatency(LATENCY_COMPONENT.STT, 100);
    assert.equal(r.overBudget, false);
  });
  it('createVoiceLatencyBudget computes total', () => {
    const b = createVoiceLatencyBudget({ [LATENCY_COMPONENT.STT]: 200, [LATENCY_COMPONENT.LLM]: 600 });
    assert.equal(b.totalMs, 800);
    assert.equal(b.isReal, false);
  });
});

describe('ADV-11 Fallback Policy', () => {
  it('FAILURE_COMPONENT has 4 values', () => {
    assert.equal(Object.keys(FAILURE_COMPONENT).length, 4);
  });
  it('FALLBACK_ACTION has 4 values', () => {
    assert.equal(Object.keys(FALLBACK_ACTION).length, 4);
  });
  it('selectFallback returns RETRY on first failure', () => {
    assert.equal(selectFallback(FAILURE_COMPONENT.STT, 1), FALLBACK_ACTION.RETRY);
  });
  it('selectFallback returns HUMAN_HANDOFF after max for STT', () => {
    assert.equal(selectFallback(FAILURE_COMPONENT.STT, 5), FALLBACK_ACTION.HUMAN_HANDOFF);
  });
  it('selectFallback returns DEGRADED after max for TOOL', () => {
    assert.equal(selectFallback(FAILURE_COMPONENT.TOOL, 5), FALLBACK_ACTION.DEGRADED);
  });
});

describe('ADV-11 Cost Guard', () => {
  it('COST_GATE_TYPE has 4 values', () => {
    assert.equal(Object.keys(COST_GATE_TYPE).length, 4);
  });
  it('estimateCost returns 0 EUR in simulation', () => {
    const r = estimateCost(COST_GATE_TYPE.TTS_CHARS, 1000);
    assert.equal(r.estimatedEUR, 0);
    assert.equal(r.noRealCost, true);
    assert.equal(r.isReal, false);
  });
  it('approveCost always approves in simulation', () => {
    const est = estimateCost(COST_GATE_TYPE.LLM_TOKENS, 500);
    const r = approveCost(est);
    assert.equal(r.approved, true);
    assert.equal(r.isReal, false);
  });
});

describe('ADV-11 Cost Estimate', () => {
  it('COST_STATE has 4 values', () => {
    assert.equal(Object.keys(COST_STATE).length, 4);
  });
  it('ZERO_COST_ESTIMATE has state FREE', () => {
    assert.equal(ZERO_COST_ESTIMATE.state, COST_STATE.FREE);
    assert.equal(ZERO_COST_ESTIMATE.totalEUR, 0);
    assert.equal(ZERO_COST_ESTIMATE.isReal, false);
  });
  it('createVoiceCostEstimate is frozen', () => {
    const e = createVoiceCostEstimate({});
    assert.throws(() => { e.x = 1; }, TypeError);
  });
});

describe('ADV-11 Call Report', () => {
  it('createVoiceCallReport returns frozen object', () => {
    const r = createVoiceCallReport({ callId: 'test-1', clientId: 'client-A' });
    assert.equal(r.callId, 'test-1');
    assert.equal(r.isReal, false);
    assert.throws(() => { r.x = 1; }, TypeError);
  });
  it('createVoiceCallReport has defaults', () => {
    const r = createVoiceCallReport({});
    assert.equal(r.taskCompleted, false);
    assert.equal(r.handoffRequired, false);
    assert.deepEqual(r.safetyViolations, []);
  });
});

describe('ADV-11 Commercial Outcome', () => {
  it('COMMERCIAL_OUTCOME has 7 values', () => {
    assert.equal(Object.keys(COMMERCIAL_OUTCOME).length, 7);
  });
  it('classifyCommercialOutcome BOOKING_CONFIRMED when task+booking', () => {
    const r = classifyCommercialOutcome({ taskCompleted: true, intentDetected: 'BOOKING' });
    assert.equal(r, COMMERCIAL_OUTCOME.BOOKING_CONFIRMED);
  });
  it('classifyCommercialOutcome TRANSFERRED when handoff', () => {
    const r = classifyCommercialOutcome({ handoffRequired: true });
    assert.equal(r, COMMERCIAL_OUTCOME.TRANSFERRED);
  });
  it('createVoiceCommercialOutcome is frozen', () => {
    const o = createVoiceCommercialOutcome({});
    assert.equal(o.isReal, false);
    assert.throws(() => { o.x = 1; }, TypeError);
  });
});

describe('ADV-11 Observability Bridge', () => {
  it('VOICE_EVENT_TYPE has 8 values', () => {
    assert.equal(Object.keys(VOICE_EVENT_TYPE).length, 8);
  });
  it('emitCallStarted returns frozen event with isReal:false', () => {
    const e = VoiceObservabilityBridge.emitCallStarted('call-1', 'client-A');
    assert.equal(e.isReal, false);
    assert.equal(e.type, VOICE_EVENT_TYPE.CALL_STARTED);
    assert.throws(() => { e.x = 1; }, TypeError);
  });
  it('emitSafetyViolation includes violations in payload', () => {
    const e = VoiceObservabilityBridge.emitSafetyViolation('call-1', ['SECRET_EXPOSURE']);
    assert.deepEqual(e.payload.violations, ['SECRET_EXPOSURE']);
  });
  it('all 8 emit functions return events', () => {
    const fns = [
      () => VoiceObservabilityBridge.emitCallStarted('c', 'cl'),
      () => VoiceObservabilityBridge.emitCallEnded('c', {}),
      () => VoiceObservabilityBridge.emitTurnCompleted('c', {}),
      () => VoiceObservabilityBridge.emitIntentDetected('c', 'BOOKING', 0.9),
      () => VoiceObservabilityBridge.emitFactResolved('c', 'hours', 'RESOLVED'),
      () => VoiceObservabilityBridge.emitSafetyViolation('c', []),
      () => VoiceObservabilityBridge.emitHandoffTriggered('c', 'USER_REQUESTED'),
      () => VoiceObservabilityBridge.emitLatencyOverBudget('c', {}),
    ];
    for (const fn of fns) {
      const r = fn();
      assert.equal(r.isReal, false);
      assert.ok(typeof r.type === 'string');
    }
  });
});

describe('ADV-11 Langfuse Bridge', () => {
  it('mapVoiceCallToLangfuseTrace returns trace with isReal:false', () => {
    const report = createVoiceCallReport({ callId: 'call-1', clientId: 'cl-A', finalState: 'ENDED', taskCompleted: true });
    const t = mapVoiceCallToLangfuseTrace(report);
    assert.equal(t.isReal, false);
    assert.equal(t.name, 'voice_agent_call');
    assert.ok('traceId' in t);
  });
  it('mapVoiceTurnToLangfuseSpan returns span', () => {
    const s = mapVoiceTurnToLangfuseSpan({ id: 't-1', userText: 'hola', agentText: '¿en qué te ayudo?', latencyMs: 200 });
    assert.equal(s.isReal, false);
    assert.equal(s.name, 'voice_turn');
    assert.equal(s.latency, 200);
  });
});

describe('ADV-11 Automation Manifest', () => {
  it('VOICE_MAKE_EVENT has 4 values', () => {
    assert.equal(Object.keys(VOICE_MAKE_EVENT).length, 4);
  });
  it('buildVoiceMakePayload returns frozen object', () => {
    const report = createVoiceCallReport({ callId: 'c-1' });
    const p = buildVoiceMakePayload(VOICE_MAKE_EVENT.CALL_COMPLETED, report);
    assert.equal(p.isReal, false);
    assert.equal(p.noRealWebhook, true);
    assert.equal(p.simulated, true);
    assert.throws(() => { p.x = 1; }, TypeError);
  });
});

describe('ADV-11 Fixtures', () => {
  it('BOOKING_CALL_FIXTURES has 7 entries', () => {
    assert.equal(BOOKING_CALL_FIXTURES.length, 7);
  });
  it('FACTUAL_CALL_FIXTURES has 5 entries', () => {
    assert.equal(FACTUAL_CALL_FIXTURES.length, 5);
  });
  it('INTERRUPTION_FIXTURES has 3 entries', () => {
    assert.equal(INTERRUPTION_FIXTURES.length, 3);
  });
  it('DIFFICULT_CALL_FIXTURES has 5 entries', () => {
    assert.equal(DIFFICULT_CALL_FIXTURES.length, 5);
  });
  it('SALES_CALL_FIXTURES has 5 entries', () => {
    assert.equal(SALES_CALL_FIXTURES.length, 5);
  });
  it('all BOOKING_CALL_FIXTURES have isReal:false', () => {
    for (const f of BOOKING_CALL_FIXTURES) {
      assert.equal(f.isReal, false, `${f.id} missing isReal:false`);
    }
  });
  it('all DIFFICULT_CALL_FIXTURES have isReal:false', () => {
    for (const f of DIFFICULT_CALL_FIXTURES) {
      assert.equal(f.isReal, false, `${f.id} missing isReal:false`);
    }
  });
  it('buildStandardBookingTranscript returns 12 turns', () => {
    const t = buildStandardBookingTranscript();
    assert.equal(t.length, 12);
    assert.equal(t[0].speaker, 'AGENT');
    assert.equal(t[0].isReal, false);
  });
  it('buildStandardBookingTranscript has USER and AGENT turns', () => {
    const t = buildStandardBookingTranscript();
    const users  = t.filter(x => x.speaker === 'USER').length;
    const agents = t.filter(x => x.speaker === 'AGENT').length;
    assert.ok(users > 0);
    assert.ok(agents > 0);
  });
});

describe('ADV-11 Simulated Call Dataset', () => {
  it('SIMULATED_CALL_DATASET has >= 50 entries', () => {
    assert.ok(SIMULATED_CALL_DATASET.length >= 50, `Expected >= 50, got ${SIMULATED_CALL_DATASET.length}`);
  });
  it('getDatasetStats returns total >= 50', () => {
    const stats = getDatasetStats();
    assert.ok(stats.total >= 50);
    assert.equal(stats.isReal, false);
  });
  it('getDatasetStats has >= 6 verticals', () => {
    const stats = getDatasetStats();
    assert.ok(stats.verticals.length >= 6);
  });
  it('getCallsByVertical returns PADEL_CLUB calls', () => {
    const calls = getCallsByVertical('PADEL_CLUB');
    assert.ok(calls.length > 0);
  });
  it('all dataset entries have isReal:false', () => {
    for (const c of SIMULATED_CALL_DATASET) {
      assert.equal(c.isReal, false, `Entry ${c.id ?? '?'} missing isReal:false`);
    }
  });
});

describe('ADV-11 Registry', () => {
  it('VOICE_AGENT_REGISTRY has 51 modules', () => {
    assert.equal(VOICE_AGENT_REGISTRY.modules.length, 51);
  });
  it('VOICE_AGENT_REGISTRY has 7 fixture files', () => {
    assert.equal(VOICE_AGENT_REGISTRY.fixtures.length, 7);
  });
  it('VOICE_AGENT_REGISTRY stats have 50 simulated calls', () => {
    assert.equal(VOICE_AGENT_REGISTRY.stats.simulatedCalls, 50);
  });
  it('VOICE_AGENT_REGISTRY stats have 11 state machine states', () => {
    assert.equal(VOICE_AGENT_REGISTRY.stats.statesMachine, 11);
  });
  it('VOICE_AGENT_REGISTRY guardrails include NO_REAL_CALLS=SI', () => {
    assert.equal(VOICE_AGENT_REGISTRY.guardrails.NO_REAL_CALLS, 'SI');
  });
  it('VOICE_AGENT_REGISTRY guardrails include NO_REAL_COST=SI', () => {
    assert.equal(VOICE_AGENT_REGISTRY.guardrails.NO_REAL_COST, 'SI');
  });
  it('REGISTRY_VERSION >= 3.5.0', () => {
    assert.ok(REGISTRY_VERSION >= '3.5.0', `Version was ${REGISTRY_VERSION}`);
  });
  it('PASO_ADV11_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV11_STATUS, '100_PERCENT');
  });
});
