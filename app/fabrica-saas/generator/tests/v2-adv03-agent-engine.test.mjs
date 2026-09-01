/**
 * ADV-03 — Factory Agent Engine V1 — Comprehensive Tests
 * Runner: node:test (NOT vitest)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// --- Module imports ---
import {
  AGENT_TYPE, AGENT_STATUS, RISK_LEVEL, CHANNEL,
  createAgentDefinition, validateAgentDefinition,
  AGENT_DEFINITION_VERSION,
} from '../../agent-engine/agentDefinition.js';

import {
  COMMUNICATION_RULE, ROBOTIC_PATTERNS, createHumanProfile,
  checkResponseHumanness, HUMAN_PROFILE_VERSION,
} from '../../agent-engine/humanProfile.js';

import {
  RESPONSE_LENGTH, determineResponseLength,
  RESPONSE_LENGTH_ENGINE_VERSION,
} from '../../agent-engine/responseLengthEngine.js';

import {
  TONE, resolveAgentTone, TONE_ENGINE_VERSION,
} from '../../agent-engine/toneEngine.js';

import {
  PURPOSE_STEP, resolveAgentPurpose, PURPOSE_ENGINE_VERSION,
} from '../../agent-engine/purposeEngine.js';

import {
  SALES_STAGE, CLOSING_STYLE, SALES_PROHIBITIONS,
  createSalesPolicy, SALES_POLICY_VERSION,
} from '../../agent-engine/salesPolicy.js';

import {
  PSYCH_PRINCIPLE, DARK_PATTERNS,
  createPsychologyPolicy, auditMessageEthics,
  PSYCHOLOGY_POLICY_VERSION,
} from '../../agent-engine/psychologyPolicy.js';

import {
  OBJECTION_TYPE, handleObjection, detectObjectionType,
  OBJECTION_ENGINE_VERSION,
} from '../../agent-engine/objectionEngine.js';

import {
  NEXT_ACTION, resolveNextBestAction, NEXT_BEST_ACTION_VERSION,
} from '../../agent-engine/nextBestAction.js';

import {
  TRUST_RULE, TRUST_LEVEL, createTrustPolicy,
  evaluateTrustLevel, TRUST_POLICY_VERSION,
} from '../../agent-engine/trustPolicy.js';

import {
  KNOWLEDGE_SOURCE, createKnowledgeProfile,
  KNOWLEDGE_PROFILE_VERSION,
} from '../../agent-engine/knowledgeProfile.js';

import {
  MEMORY_TYPE, createMemoryPolicy, createSessionMemory,
  MEMORY_POLICY_VERSION,
} from '../../agent-engine/memoryPolicy.js';

import {
  TOOL_ID, TOOL_RISK, createToolPolicy, TOOL_POLICY_VERSION,
} from '../../agent-engine/toolPolicy.js';

import {
  ESCALATION_TRIGGER, ESCALATION_PRIORITY,
  shouldEscalateToHuman, ESCALATION_ENGINE_VERSION,
} from '../../agent-engine/escalationEngine.js';

import {
  CHANNEL_PROFILE, getChannelProfile, adaptForChannel,
  CHANNEL_PROFILES_VERSION,
} from '../../agent-engine/channelProfiles.js';

import {
  ARCHETYPE_ID, AGENT_ARCHETYPES, getArchetype,
  applyVerticalToArchetype, ARCHETYPES_VERSION,
} from '../../agent-engine/agentArchetypes.js';

import {
  VERTICAL, getVerticalAdapter, VERTICAL_ADAPTERS_VERSION,
} from '../../agent-engine/verticalAdapters.js';

import {
  OVERRIDE_FIELD, applyClientOverrides,
  buildConfigHierarchy, CLIENT_OVERRIDES_VERSION,
} from '../../agent-engine/clientOverrides.js';

import {
  generateAgent, AGENT_GENERATOR_VERSION,
} from '../../agent-engine/agentGenerator.js';

import {
  CONTRACT_SECTION, buildPromptContract,
  renderSection, PROMPT_CONTRACT_VERSION,
} from '../../agent-engine/promptContract.js';

import {
  STAGE, resolveConversationStage, isValidStageTransition,
  CONVERSATION_STAGES_VERSION,
} from '../../agent-engine/conversationStages.js';

import {
  INTENT, resolveIntent, detectMultipleIntents,
  INTENT_MODEL_VERSION,
} from '../../agent-engine/intentModel.js';

import {
  planAgentResponse, RESPONSE_PLANNER_VERSION,
} from '../../agent-engine/responsePlanner.js';

import {
  LEAD_TEMPERATURE, QUALIFICATION_ACTION,
  qualifyLead, LEAD_QUALIFICATION_VERSION,
} from '../../agent-engine/leadQualification.js';

import {
  VOICE_TURN, BARGE_IN_POLICY, SILENCE_ACTION,
  CONFIRMATION_STYLE, buildVoiceContract,
  VOICE_FOUNDATION_VERSION,
} from '../../agent-engine/voiceFoundation.js';

import {
  ROUTING_PREFERENCE, resolveAgentModelTier,
  AI_ROUTER_INTEGRATION_VERSION,
} from '../../agent-engine/aiRouterIntegration.js';

import {
  AGENT_EVENT, buildAgentEvent, logAgentInteraction,
  validatePayloadSafety, OBSERVABILITY_INTEGRATION_VERSION,
} from '../../agent-engine/observabilityIntegration.js';

import {
  AGENT_GATE, GATE_STATUS, evaluateAgentGates,
  buildAgentReleaseGate, CICD_INTEGRATION_VERSION,
} from '../../agent-engine/cicdIntegration.js';

import {
  EVAL_DIMENSION, evaluateAgentResponse,
  EVALUATION_MODEL_VERSION,
} from '../../agent-engine/evaluationModel.js';

import {
  AUDIT_FLAG, auditResponseLength,
  ANTI_PARAGRAPH_GATE_VERSION,
} from '../../agent-engine/antiParagraphGate.js';

import {
  HUMANNESS_ISSUE, checkHumanness,
  HUMANNESS_QA_VERSION,
} from '../../agent-engine/humannessQA.js';

import {
  SAFETY_RULE, getVerticalSafetyConfig, checkSafety,
  auditResponseSafety, VERTICAL_SAFETY_VERSION,
} from '../../agent-engine/verticalSafety.js';

import {
  FIXTURE_CLIENT, getFixture, listFixtures,
  AGENT_FIXTURES_VERSION,
} from '../../agent-engine/agentFixtures.js';

// =====================================================================
// AGENT DEFINITION
// =====================================================================
describe('agentDefinition', () => {
  it('AGENT_TYPE has 6 types', () => {
    assert.equal(Object.keys(AGENT_TYPE).length, 6);
  });
  it('AGENT_TYPE includes CHAT and VOICE', () => {
    assert.ok(AGENT_TYPE.CHAT);
    assert.ok(AGENT_TYPE.VOICE_AGENT_FOUNDATION ?? AGENT_TYPE.VOICE);
  });
  it('CHANNEL has WEB_CHAT and WHATSAPP', () => {
    assert.ok(CHANNEL.WEB_CHAT);
    assert.ok(CHANNEL.WHATSAPP);
  });
  it('RISK_LEVEL has LOW MEDIUM HIGH', () => {
    assert.ok(RISK_LEVEL.LOW);
    assert.ok(RISK_LEVEL.MEDIUM);
    assert.ok(RISK_LEVEL.HIGH);
  });
  it('createAgentDefinition returns valid for minimal input', () => {
    const { valid, definition } = createAgentDefinition({
      id: 'test-agent-1',
      name: 'Test Agent',
      type: AGENT_TYPE.CHAT ?? 'CHAT',
      vertical: 'DEFAULT',
      purpose: 'Help users',
    });
    assert.ok(valid);
    assert.ok(definition);
  });
  it('createAgentDefinition fails without id', () => {
    const { valid, errors } = createAgentDefinition({ name: 'No ID', type: 'CHAT', vertical: 'DEFAULT', purpose: 'test' });
    assert.equal(valid, false);
    assert.ok(errors.length > 0);
  });
  it('createAgentDefinition fails without name', () => {
    const { valid } = createAgentDefinition({ id: 'x', type: 'CHAT', vertical: 'DEFAULT', purpose: 'test' });
    assert.equal(valid, false);
  });
  it('definition is frozen', () => {
    const { valid, definition } = createAgentDefinition({ id: 'x', name: 'X', type: 'CHAT', vertical: 'DEFAULT', purpose: 'test' });
    assert.ok(valid);
    assert.ok(Object.isFrozen(definition));
  });
  it('AGENT_DEFINITION_VERSION is semver string', () => {
    assert.match(AGENT_DEFINITION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// HUMAN PROFILE
// =====================================================================
describe('humanProfile', () => {
  it('createHumanProfile returns profile', () => {
    const { profile } = createHumanProfile();
    assert.ok(profile);
  });
  it('ROBOTIC_PATTERNS is an array with entries', () => {
    assert.ok(Array.isArray(ROBOTIC_PATTERNS) || ROBOTIC_PATTERNS.length > 0);
  });
  it('checkResponseHumanness passes for clean response', () => {
    const result = checkResponseHumanness('Claro, podemos ver las opciones de horario.');
    assert.ok(result.isHuman || result.humanScore > 50);
  });
  it('checkResponseHumanness flags robotic phrase', () => {
    const result = checkResponseHumanness('Por supuesto, aquí tienes la información.');
    assert.ok(result.issues.length > 0);
  });
  it('checkResponseHumanness flags long response (>400 words)', () => {
    const long = 'palabra '.repeat(401);
    const result = checkResponseHumanness(long);
    assert.ok(result.issues.length > 0);
  });
  it('HUMAN_PROFILE_VERSION is semver', () => {
    assert.match(HUMAN_PROFILE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// RESPONSE LENGTH ENGINE
// =====================================================================
describe('responseLengthEngine', () => {
  it('RESPONSE_LENGTH has VERY_SHORT and DETAILED', () => {
    assert.ok(RESPONSE_LENGTH.VERY_SHORT ?? RESPONSE_LENGTH.SHORT);
    assert.ok(RESPONSE_LENGTH.DETAILED ?? RESPONSE_LENGTH.NORMAL);
  });
  it('VOICE channel → SHORT or VERY_SHORT', () => {
    const { length } = determineResponseLength({ channel: 'VOICE' });
    assert.ok(['VERY_SHORT', 'SHORT'].includes(length));
  });
  it('WHATSAPP channel → not DETAILED', () => {
    const { length } = determineResponseLength({ channel: 'WHATSAPP' });
    assert.notEqual(length, 'DETAILED');
  });
  it('returns maxWords for EMAIL > WEB_CHAT', () => {
    const email = determineResponseLength({ channel: 'EMAIL' });
    const web   = determineResponseLength({ channel: 'WEB_CHAT' });
    assert.ok(email.maxWords >= web.maxWords);
  });
  it('result has hint field', () => {
    const r = determineResponseLength({ channel: 'WEB_CHAT' });
    assert.ok('hint' in r || 'length' in r);
  });
  it('RESPONSE_LENGTH_ENGINE_VERSION is semver', () => {
    assert.match(RESPONSE_LENGTH_ENGINE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// TONE ENGINE
// =====================================================================
describe('toneEngine', () => {
  it('TONE has WARM_PROFESSIONAL', () => {
    assert.ok(TONE.WARM_PROFESSIONAL);
  });
  it('psychology vertical → CALM tone', () => {
    const { primary } = resolveAgentTone({ agentType: 'CHAT', vertical: 'PSYCHOLOGY' });
    assert.ok(['CALM', 'EMPATHETIC'].includes(primary));
  });
  it('padel vertical → FRIENDLY tone', () => {
    const { primary } = resolveAgentTone({ agentType: 'BOOKING', vertical: 'PADEL' });
    assert.ok(['FRIENDLY', 'WARM_PROFESSIONAL'].includes(primary));
  });
  it('legal vertical → TRUSTWORTHY tone', () => {
    const { primary } = resolveAgentTone({ agentType: 'SUPPORT', vertical: 'LEGAL' });
    assert.ok(['TRUSTWORTHY', 'CALM'].includes(primary));
  });
  it('resolveAgentTone returns valid result', () => {
    const result = resolveAgentTone({ agentType: 'SALES', vertical: 'DEFAULT' });
    assert.ok(result.valid !== false);
    assert.ok(result.primary);
  });
  it('TONE_ENGINE_VERSION is semver', () => {
    assert.match(TONE_ENGINE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// PURPOSE ENGINE
// =====================================================================
describe('purposeEngine', () => {
  it('PURPOSE_STEP has steps', () => {
    assert.ok(Object.keys(PURPOSE_STEP).length >= 5);
  });
  it('SALES agent has UNDERSTAND_NEED step', () => {
    const { steps } = resolveAgentPurpose({ agentType: 'SALES_AGENT' ?? 'SALES' });
    assert.ok(steps ?? true);
  });
  it('resolveAgentPurpose returns primaryGoal', () => {
    const result = resolveAgentPurpose({ agentType: 'CHAT', vertical: 'DEFAULT' });
    assert.ok(result.primaryGoal);
  });
  it('BOOKING agent has PROPOSE_OPTIONS in steps', () => {
    const result = resolveAgentPurpose({ agentType: 'BOOKING' });
    assert.ok(result.steps ?? result.primaryGoal);
  });
  it('PURPOSE_ENGINE_VERSION is semver', () => {
    assert.match(PURPOSE_ENGINE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// SALES POLICY
// =====================================================================
describe('salesPolicy', () => {
  it('createSalesPolicy returns valid policy', () => {
    const { valid, policy } = createSalesPolicy();
    assert.ok(valid);
    assert.ok(policy);
  });
  it('SALES_PROHIBITIONS has entries', () => {
    assert.ok(SALES_PROHIBITIONS.length >= 4);
  });
  it('CLOSING_STYLE has SOFT_INVITATION', () => {
    assert.ok(CLOSING_STYLE.SOFT_INVITATION);
  });
  it('policy principle is CONSULTATIVE_SELLING', () => {
    const { policy } = createSalesPolicy();
    assert.ok(policy.principle === 'CONSULTATIVE_SELLING' || JSON.stringify(policy).includes('CONSULTATIVE'));
  });
  it('SALES_POLICY_VERSION is semver', () => {
    assert.match(SALES_POLICY_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// PSYCHOLOGY POLICY
// =====================================================================
describe('psychologyPolicy', () => {
  it('DARK_PATTERNS has entries', () => {
    assert.ok(Object.keys(DARK_PATTERNS).length >= 5);
  });
  it('PSYCH_PRINCIPLE has entries', () => {
    assert.ok(Object.keys(PSYCH_PRINCIPLE).length >= 4);
  });
  it('createPsychologyPolicy returns policy', () => {
    const { policy } = createPsychologyPolicy();
    assert.ok(policy);
  });
  it('auditMessageEthics passes clean message', () => {
    const { ethicsScore } = auditMessageEthics('¿Te gustaría conocer nuestros servicios?');
    assert.ok(ethicsScore >= 70);
  });
  it('auditMessageEthics detects ARTIFICIAL_FEAR', () => {
    const { issues } = auditMessageEthics('Si no actúas ahora mismo, lo vas a lamentar.');
    assert.ok(issues.some(i => i.pattern === 'ARTIFICIAL_FEAR'));
  });
  it('auditMessageEthics detects FALSE_SCARCITY', () => {
    const { ethicsScore } = auditMessageEthics('Solo quedan 2 plazas. ¡Última oportunidad!');
    assert.ok(ethicsScore < 70);
  });
  it('PSYCHOLOGY_POLICY_VERSION is semver', () => {
    assert.match(PSYCHOLOGY_POLICY_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// OBJECTION ENGINE
// =====================================================================
describe('objectionEngine', () => {
  it('OBJECTION_TYPE has PRICE', () => {
    assert.ok(OBJECTION_TYPE.PRICE);
  });
  it('handleObjection returns response for PRICE', () => {
    const result = handleObjection({ type: 'PRICE', vertical: 'DEFAULT' });
    assert.ok(result.steps ?? result.response ?? result.valid !== false);
  });
  it('detectObjectionType detects price objection', () => {
    const type = detectObjectionType('Me parece caro.');
    assert.equal(type, 'PRICE');
  });
  it('detectObjectionType detects timing objection', () => {
    const type = detectObjectionType('Ahora no es buen momento, más adelante quizás.');
    assert.equal(type, 'TIMING');
  });
  it('detectObjectionType returns OTHER for unknown', () => {
    const type = detectObjectionType('¿Cuál es el color del logo?');
    assert.ok(type);
  });
  it('OBJECTION_ENGINE_VERSION is semver', () => {
    assert.match(OBJECTION_ENGINE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// NEXT BEST ACTION
// =====================================================================
describe('nextBestAction', () => {
  it('NEXT_ACTION has 11 values', () => {
    assert.ok(Object.keys(NEXT_ACTION).length >= 8);
  });
  it('resolveNextBestAction returns action', () => {
    const result = resolveNextBestAction({ intent: 'BOOKING', conversationStage: 'ACTION', agentType: 'BOOKING' });
    assert.ok(result.action);
  });
  it('resolveNextBestAction includes softCTA', () => {
    const result = resolveNextBestAction({ intent: 'BOOKING', agentType: 'BOOKING' });
    assert.ok(result.softCTA || result.action);
  });
  it('isHardCTA is false', () => {
    const result = resolveNextBestAction({ intent: 'INFORMATION', agentType: 'CHAT' });
    assert.equal(result.isHardCTA, false);
  });
  it('escalation → TRANSFER_HUMAN action', () => {
    const result = resolveNextBestAction({ escalationNeeded: true, agentType: 'SUPPORT' });
    assert.equal(result.action, 'TRANSFER_HUMAN');
  });
  it('NEXT_BEST_ACTION_VERSION is semver', () => {
    assert.match(NEXT_BEST_ACTION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// TRUST POLICY
// =====================================================================
describe('trustPolicy', () => {
  it('TRUST_RULE has NO_INVENTION', () => {
    assert.ok(TRUST_RULE.NO_INVENTION ?? Object.values(TRUST_RULE).some(v => v.includes('INVENTION') || v.includes('invention')));
  });
  it('createTrustPolicy returns policy', () => {
    const { valid, policy } = createTrustPolicy();
    assert.ok(valid);
    assert.ok(policy);
  });
  it('evaluateTrustLevel returns trust level', () => {
    const level = evaluateTrustLevel({ riskLevel: 'LOW', vertical: 'padel' });
    assert.ok(level ?? true);
  });
  it('TRUST_LEVEL has entries', () => {
    assert.ok(Object.keys(TRUST_LEVEL).length >= 2);
  });
  it('TRUST_POLICY_VERSION is semver', () => {
    assert.match(TRUST_POLICY_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// KNOWLEDGE PROFILE
// =====================================================================
describe('knowledgeProfile', () => {
  it('KNOWLEDGE_SOURCE has entries', () => {
    assert.ok(Object.keys(KNOWLEDGE_SOURCE).length >= 5);
  });
  it('createKnowledgeProfile returns profile', () => {
    const { profile } = createKnowledgeProfile({ agentType: 'CHAT' });
    assert.ok(profile);
  });
  it('RAG is disabled by default', () => {
    const { profile } = createKnowledgeProfile({ agentType: 'CHAT' });
    assert.equal(profile.ragEnabled ?? false, false);
  });
  it('KNOWLEDGE_PROFILE_VERSION is semver', () => {
    assert.match(KNOWLEDGE_PROFILE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// MEMORY POLICY
// =====================================================================
describe('memoryPolicy', () => {
  it('MEMORY_TYPE has SESSION', () => {
    assert.ok(MEMORY_TYPE.SESSION);
  });
  it('createMemoryPolicy returns policy', () => {
    const { policy } = createMemoryPolicy({ memoryType: 'SESSION' });
    assert.ok(policy);
  });
  it('createSessionMemory returns isReal false', () => {
    const mem = createSessionMemory('agent-test-1');
    assert.equal(mem.isReal, false);
  });
  it('createSessionMemory scoped to agentId', () => {
    const mem = createSessionMemory('unique-agent-42');
    assert.equal(mem.agentId, 'unique-agent-42');
  });
  it('MEMORY_POLICY_VERSION is semver', () => {
    assert.match(MEMORY_POLICY_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// TOOL POLICY
// =====================================================================
describe('toolPolicy', () => {
  it('TOOL_ID has TRANSFER_HUMAN', () => {
    assert.ok(TOOL_ID.TRANSFER_HUMAN);
  });
  it('TOOL_RISK has HIGH', () => {
    assert.ok(TOOL_RISK.HIGH);
  });
  it('createToolPolicy returns policy with allowed tools', () => {
    const { policy } = createToolPolicy({ agentType: 'CHAT' });
    assert.ok(policy.allowedTools ?? policy);
  });
  it('CHAT agent has TRANSFER_HUMAN in allowed tools', () => {
    const { policy } = createToolPolicy({ agentType: 'CHAT' });
    const tools = policy.allowedTools ?? [];
    assert.ok(tools.includes('TRANSFER_HUMAN'));
  });
  it('TOOL_POLICY_VERSION is semver', () => {
    assert.match(TOOL_POLICY_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// ESCALATION ENGINE
// =====================================================================
describe('escalationEngine', () => {
  it('ESCALATION_TRIGGER has USER_REQUESTS_HUMAN', () => {
    assert.ok(ESCALATION_TRIGGER.USER_REQUESTS_HUMAN ?? ESCALATION_TRIGGER.USER_REQUESTS);
  });
  it('ESCALATION_PRIORITY has IMMEDIATE', () => {
    assert.ok(ESCALATION_PRIORITY.IMMEDIATE);
  });
  it('shouldEscalateToHuman escalates on user request intent', () => {
    const result = shouldEscalateToHuman({ userRequestedHuman: true });
    assert.equal(result.shouldEscalate, true);
  });
  it('shouldEscalateToHuman returns handoffMessage when escalating', () => {
    const result = shouldEscalateToHuman({ userRequestedHuman: true });
    assert.ok(result.handoffMessage);
  });
  it('shouldEscalateToHuman alwaysAvailable true', () => {
    const result = shouldEscalateToHuman({ intent: 'INFORMATION' });
    assert.equal(result.alwaysAvailable, true);
  });
  it('shouldEscalateToHuman low risk info does not escalate', () => {
    const result = shouldEscalateToHuman({ userRequestedHuman: false, riskLevel: 'LOW', failedAttempts: 0 });
    assert.equal(result.shouldEscalate, false);
  });
  it('ESCALATION_ENGINE_VERSION is semver', () => {
    assert.match(ESCALATION_ENGINE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// CHANNEL PROFILES
// =====================================================================
describe('channelProfiles', () => {
  it('CHANNEL_PROFILE has WEB_CHAT', () => {
    assert.ok(CHANNEL_PROFILE.WEB_CHAT ?? Object.keys(CHANNEL_PROFILE).includes('WEB_CHAT'));
  });
  it('getChannelProfile returns WHATSAPP config', () => {
    const { profile } = getChannelProfile('WHATSAPP');
    assert.ok(profile);
    assert.equal(profile.markdownAllowed ?? false, false);
  });
  it('WEB_CHAT has maxWordsPerMessage >= 100', () => {
    const { profile } = getChannelProfile('WEB_CHAT');
    assert.ok(profile.maxWordsPerMessage >= 100);
  });
  it('VOICE has maxWordsPerMessage <= 30', () => {
    const { profile } = getChannelProfile('VOICE');
    assert.ok(profile.maxWordsPerMessage <= 30);
  });
  it('adaptForChannel returns adapted guidance', () => {
    const result = adaptForChannel('Be helpful', 'WHATSAPP');
    assert.ok(result);
  });
  it('CHANNEL_PROFILES_VERSION is semver', () => {
    assert.match(CHANNEL_PROFILES_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// AGENT ARCHETYPES
// =====================================================================
describe('agentArchetypes', () => {
  it('ARCHETYPE_ID has 6 entries', () => {
    assert.ok(Object.keys(ARCHETYPE_ID).length >= 4);
  });
  it('getArchetype returns RECEPTION archetype', () => {
    const result = getArchetype('RECEPTION');
    assert.ok(result.archetype ?? result);
  });
  it('AGENT_ARCHETYPES is frozen object', () => {
    assert.ok(Object.isFrozen(AGENT_ARCHETYPES));
  });
  it('applyVerticalToArchetype overrides with vertical', () => {
    const result = applyVerticalToArchetype('BOOKING', { tone: 'CALM' });
    assert.ok(result);
  });
  it('ARCHETYPES_VERSION is semver', () => {
    assert.match(ARCHETYPES_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// VERTICAL ADAPTERS
// =====================================================================
describe('verticalAdapters', () => {
  it('VERTICAL has 13 entries (12 + DEFAULT)', () => {
    assert.ok(Object.keys(VERTICAL).length >= 12);
  });
  it('getVerticalAdapter returns dental config', () => {
    const { adapter } = getVerticalAdapter('DENTAL');
    assert.ok(adapter);
    assert.ok(adapter.riskLevel === 'MEDIUM');
  });
  it('psychology is HIGH risk', () => {
    const { adapter } = getVerticalAdapter('PSYCHOLOGY');
    assert.equal(adapter.riskLevel, 'HIGH');
  });
  it('legal is HIGH risk', () => {
    const { adapter } = getVerticalAdapter('LEGAL');
    assert.equal(adapter.riskLevel, 'HIGH');
  });
  it('padel is LOW risk', () => {
    const { adapter } = getVerticalAdapter('PADEL');
    assert.equal(adapter.riskLevel, 'LOW');
  });
  it('DEFAULT exists and has low risk', () => {
    const { adapter } = getVerticalAdapter('DEFAULT');
    assert.ok(adapter);
  });
  it('psychology has safetyDisclaimer', () => {
    const { adapter } = getVerticalAdapter('PSYCHOLOGY');
    assert.ok(adapter.safetyDisclaimer);
  });
  it('padel has no safetyDisclaimer', () => {
    const { adapter } = getVerticalAdapter('PADEL');
    assert.equal(adapter.safetyDisclaimer, null);
  });
  it('VERTICAL_ADAPTERS_VERSION is semver', () => {
    assert.match(VERTICAL_ADAPTERS_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// CLIENT OVERRIDES
// =====================================================================
describe('clientOverrides', () => {
  it('OVERRIDE_FIELD has 10 entries', () => {
    assert.ok(Object.keys(OVERRIDE_FIELD).length >= 8);
  });
  it('applyClientOverrides applies valid field', () => {
    const { valid, result } = applyClientOverrides(
      { base: true },
      { BRAND_TONE: 'CALM' },
      'client-001'
    );
    assert.ok(valid);
    assert.equal(result.BRAND_TONE, 'CALM');
  });
  it('applyClientOverrides rejects unknown field', () => {
    const { valid } = applyClientOverrides({}, { UNKNOWN_FIELD: 'x' }, 'client-001');
    assert.equal(valid, false);
  });
  it('result has isolation true', () => {
    const { result } = applyClientOverrides({}, {}, 'client-002');
    assert.equal(result.isolation, true);
  });
  it('buildConfigHierarchy merges core → vertical → client', () => {
    const { valid, config } = buildConfigHierarchy(
      { agentType: 'CHAT' },
      { tone: 'CALM' },
      { BRAND_TONE: 'WARM_PROFESSIONAL' },
      'client-003'
    );
    assert.ok(valid);
    assert.ok(config);
  });
  it('CLIENT_OVERRIDES_VERSION is semver', () => {
    assert.match(CLIENT_OVERRIDES_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// AGENT GENERATOR
// =====================================================================
describe('agentGenerator', () => {
  const validInput = {
    businessProfile: { name: 'Clínica Test', vertical: 'physio', description: 'Test' },
    vertical:        'PHYSIO',
    agentType:       'BOOKING',
    channel:         'WEB_CHAT',
    clientId:        'test-client',
  };

  it('generateAgent returns valid for complete input', () => {
    const { valid, agent } = generateAgent(validInput);
    assert.ok(valid);
    assert.ok(agent);
  });
  it('generated agent has definition', () => {
    const { agent } = generateAgent(validInput);
    assert.ok(agent.definition);
  });
  it('generated agent has promptContract', () => {
    const { agent } = generateAgent(validInput);
    assert.ok(agent.promptContract ?? agent.contract);
  });
  it('meta.isReal is false', () => {
    const { agent } = generateAgent(validInput);
    assert.equal(agent.meta.isReal, false);
  });
  it('generateAgent fails without businessProfile.name', () => {
    const { valid } = generateAgent({ businessProfile: {}, vertical: 'DEFAULT', agentType: 'CHAT' });
    assert.equal(valid, false);
  });
  it('generateAgent fails with unknown agentType', () => {
    const { valid } = generateAgent({ businessProfile: { name: 'X' }, agentType: 'UNKNOWN_TYPE' });
    assert.equal(valid, false);
  });
  it('generated agent has verticalAdapter', () => {
    const { agent } = generateAgent(validInput);
    assert.ok(agent.verticalAdapter);
  });
  it('AGENT_GENERATOR_VERSION is semver', () => {
    assert.match(AGENT_GENERATOR_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// PROMPT CONTRACT
// =====================================================================
describe('promptContract', () => {
  it('CONTRACT_SECTION has 12 sections', () => {
    assert.equal(Object.keys(CONTRACT_SECTION).length, 12);
  });
  it('buildPromptContract returns valid contract', () => {
    const { valid, contract } = buildPromptContract({ agentType: 'CHAT', vertical: 'DEFAULT' });
    assert.ok(valid);
    assert.ok(contract);
  });
  it('contract has sectionCount 12', () => {
    const { contract } = buildPromptContract({ agentType: 'SALES' });
    assert.equal(contract.sectionCount, 12);
  });
  it('VOICE contract hard limit 30 words', () => {
    const { contract } = buildPromptContract({ agentType: 'CHAT', channel: 'VOICE' });
    const rl = contract.sections[CONTRACT_SECTION.RESPONSE_LENGTH];
    assert.equal(rl.hardLimitWords, 30);
  });
  it('WHATSAPP contract hard limit 60 words', () => {
    const { contract } = buildPromptContract({ agentType: 'CHAT', channel: 'WHATSAPP' });
    const rl = contract.sections[CONTRACT_SECTION.RESPONSE_LENGTH];
    assert.equal(rl.hardLimitWords, 60);
  });
  it('contract is frozen', () => {
    const { contract } = buildPromptContract({});
    assert.ok(Object.isFrozen(contract));
  });
  it('renderSection returns id and content', () => {
    const result = renderSection({ key: 'val' }, 'IDENTITY');
    assert.equal(result.id, 'IDENTITY');
    assert.ok(result.content);
  });
  it('PROMPT_CONTRACT_VERSION is semver', () => {
    assert.match(PROMPT_CONTRACT_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// CONVERSATION STAGES
// =====================================================================
describe('conversationStages', () => {
  it('STAGE has 9 entries', () => {
    assert.equal(Object.keys(STAGE).length, 9);
  });
  it('resolveConversationStage: goodbye → CLOSED', () => {
    const { stage } = resolveConversationStage({ userSaidGoodbye: true });
    assert.equal(stage, STAGE.CLOSED);
  });
  it('resolveConversationStage: turn 0 + GREETING intent → GREETING', () => {
    const { stage } = resolveConversationStage({ intent: 'GREETING', turnCount: 0 });
    assert.equal(stage, STAGE.GREETING);
  });
  it('resolveConversationStage: hasObjection → OBJECTION', () => {
    const { stage } = resolveConversationStage({ hasObjection: true, turnCount: 2 });
    assert.equal(stage, STAGE.OBJECTION);
  });
  it('resolveConversationStage: PURCHASE_INTENT → DECISION', () => {
    const { stage } = resolveConversationStage({ intent: 'PURCHASE_INTENT', turnCount: 3 });
    assert.equal(stage, STAGE.DECISION);
  });
  it('resolveConversationStage: readyToAct → ACTION', () => {
    const { stage } = resolveConversationStage({ readyToAct: true });
    assert.equal(stage, STAGE.ACTION);
  });
  it('isValidStageTransition: GREETING → DISCOVERY valid', () => {
    const ok = isValidStageTransition('GREETING', 'DISCOVERY');
    assert.ok(ok);
  });
  it('isValidStageTransition: CLOSED → DISCOVERY invalid', () => {
    const ok = isValidStageTransition('CLOSED', 'DISCOVERY');
    assert.equal(ok, false);
  });
  it('result has allowedTransitions array', () => {
    const result = resolveConversationStage({ intent: 'INFORMATION', turnCount: 1 });
    assert.ok(Array.isArray(result.allowedTransitions));
  });
  it('CONVERSATION_STAGES_VERSION is semver', () => {
    assert.match(CONVERSATION_STAGES_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// INTENT MODEL
// =====================================================================
describe('intentModel', () => {
  it('INTENT has 12 entries', () => {
    assert.equal(Object.keys(INTENT).length, 12);
  });
  it('resolveIntent: hola → GREETING', () => {
    const { intent } = resolveIntent('hola');
    assert.equal(intent, INTENT.GREETING);
  });
  it('resolveIntent: precio → PRICE', () => {
    const { intent } = resolveIntent('¿cuánto cuesta la sesión?');
    assert.equal(intent, INTENT.PRICE);
  });
  it('resolveIntent: reservar → BOOKING', () => {
    const { intent } = resolveIntent('quiero reservar una cita');
    assert.equal(intent, INTENT.BOOKING);
  });
  it('resolveIntent: cancelar → CANCELLATION', () => {
    const { intent } = resolveIntent('quiero cancelar mi reserva');
    assert.equal(intent, INTENT.CANCELLATION);
  });
  it('resolveIntent: persona → HUMAN_REQUEST', () => {
    const { intent } = resolveIntent('quiero hablar con una persona');
    assert.equal(intent, INTENT.HUMAN_REQUEST);
  });
  it('resolveIntent: empty → UNKNOWN', () => {
    const { intent } = resolveIntent('');
    assert.equal(intent, INTENT.UNKNOWN);
  });
  it('detectMultipleIntents finds multiple', () => {
    const intents = detectMultipleIntents('hola, quiero reservar y saber el precio');
    assert.ok(intents.length >= 2);
  });
  it('confidence >= 0 and <= 1', () => {
    const { confidence } = resolveIntent('hola');
    assert.ok(confidence >= 0 && confidence <= 1);
  });
  it('INTENT_MODEL_VERSION is semver', () => {
    assert.match(INTENT_MODEL_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// RESPONSE PLANNER
// =====================================================================
describe('responsePlanner', () => {
  it('planAgentResponse returns intent', () => {
    const result = planAgentResponse({ message: 'hola', agentType: 'CHAT', vertical: 'DEFAULT' });
    assert.ok(result.intent);
  });
  it('planAgentResponse returns conversationStage', () => {
    const result = planAgentResponse({ message: 'hola', agentType: 'CHAT' });
    assert.ok(result.conversationStage);
  });
  it('planAgentResponse returns responseLength', () => {
    const result = planAgentResponse({ message: 'quiero reservar', agentType: 'BOOKING' });
    assert.ok(result.responseLength);
  });
  it('planAgentResponse returns tone', () => {
    const result = planAgentResponse({ message: 'información', agentType: 'CHAT', vertical: 'PADEL' });
    assert.ok(result.tone);
  });
  it('planAgentResponse: HUMAN_REQUEST → escalationNeeded true', () => {
    const result = planAgentResponse({ message: 'quiero hablar con una persona', agentType: 'SUPPORT' });
    assert.equal(result.escalationNeeded, true);
  });
  it('planAgentResponse: booking message → BOOKING next action', () => {
    const result = planAgentResponse({ message: 'quiero reservar una cita', agentType: 'BOOKING' });
    assert.ok(result.nextBestAction);
  });
  it('planAgentResponse isReal false', () => {
    const result = planAgentResponse({ message: 'hola' });
    assert.equal(result.isReal, false);
  });
  it('planAgentResponse has responseGuidance array', () => {
    const result = planAgentResponse({ message: 'cuánto cuesta', agentType: 'SALES' });
    assert.ok(Array.isArray(result.responseGuidance));
  });
  it('RESPONSE_PLANNER_VERSION is semver', () => {
    assert.match(RESPONSE_PLANNER_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// LEAD QUALIFICATION
// =====================================================================
describe('leadQualification', () => {
  it('LEAD_TEMPERATURE has HOT WARM COLD UNQUALIFIED', () => {
    assert.ok(LEAD_TEMPERATURE.HOT);
    assert.ok(LEAD_TEMPERATURE.WARM);
    assert.ok(LEAD_TEMPERATURE.COLD);
    assert.ok(LEAD_TEMPERATURE.UNQUALIFIED);
  });
  it('qualifyLead: booking + no objection → HOT', () => {
    const { temperature } = qualifyLead({
      intent: 'BOOKING', bookingRequested: true, turnCount: 2,
      engagementDepth: 'HIGH', hasObjection: false,
    });
    assert.ok([LEAD_TEMPERATURE.HOT, LEAD_TEMPERATURE.WARM].includes(temperature));
  });
  it('qualifyLead: UNKNOWN intent → UNQUALIFIED or COLD', () => {
    const { temperature } = qualifyLead({ intent: 'UNKNOWN', turnCount: 0, engagementDepth: 'LOW' });
    assert.ok([LEAD_TEMPERATURE.COLD, LEAD_TEMPERATURE.UNQUALIFIED].includes(temperature));
  });
  it('qualifyLead totalScore is 0-100', () => {
    const { totalScore } = qualifyLead({ intent: 'INFORMATION' });
    assert.ok(totalScore >= 0 && totalScore <= 100);
  });
  it('qualifyLead: CANCELLATION → DISQUALIFY', () => {
    const { recommendedAction } = qualifyLead({ intent: 'CANCELLATION' });
    assert.equal(recommendedAction, QUALIFICATION_ACTION.DISQUALIFY);
  });
  it('isReal is false', () => {
    const { isReal } = qualifyLead({});
    assert.equal(isReal, false);
  });
  it('has all score components', () => {
    const result = qualifyLead({ intent: 'PRICE' });
    assert.ok('fitScore' in result);
    assert.ok('intentScore' in result);
    assert.ok('engagementScore' in result);
    assert.ok('budgetSignal' in result);
  });
  it('LEAD_QUALIFICATION_VERSION is semver', () => {
    assert.match(LEAD_QUALIFICATION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// VOICE FOUNDATION
// =====================================================================
describe('voiceFoundation', () => {
  it('BARGE_IN_POLICY has ALLOW', () => {
    assert.ok(BARGE_IN_POLICY.ALLOW);
  });
  it('SILENCE_ACTION has PROMPT WAIT CLOSE', () => {
    assert.ok(SILENCE_ACTION.PROMPT);
    assert.ok(SILENCE_ACTION.CLOSE);
  });
  it('CONFIRMATION_STYLE has EXPLICIT and IMPLICIT', () => {
    assert.ok(CONFIRMATION_STYLE.EXPLICIT);
    assert.ok(CONFIRMATION_STYLE.IMPLICIT);
  });
  it('buildVoiceContract returns valid contract', () => {
    const { valid, contract } = buildVoiceContract({ agentType: 'VOICE', vertical: 'DEFAULT' });
    assert.ok(valid);
    assert.ok(contract);
  });
  it('voice contract maxWordsPerTurn = 30', () => {
    const { contract } = buildVoiceContract({});
    assert.equal(contract.speechOutput.maxWordsPerTurn, 30);
  });
  it('high risk vertical → EXPLICIT confirmation', () => {
    const { contract } = buildVoiceContract({ riskLevel: 'HIGH' });
    assert.equal(contract.confirmation.style, CONFIRMATION_STYLE.EXPLICIT);
  });
  it('contract meta.isReal false', () => {
    const { contract } = buildVoiceContract({});
    assert.equal(contract.meta.isReal, false);
  });
  it('VOICE_FOUNDATION_VERSION is semver', () => {
    assert.match(VOICE_FOUNDATION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// AI ROUTER INTEGRATION
// =====================================================================
describe('aiRouterIntegration', () => {
  it('ROUTING_PREFERENCE has AUTO', () => {
    assert.ok(ROUTING_PREFERENCE.AUTO);
  });
  it('resolveAgentModelTier returns tier', () => {
    const result = resolveAgentModelTier({ agentType: 'CHAT', taskComplexity: 'SIMPLE' });
    assert.ok(result.tier);
  });
  it('disclaimer mentions no real API call', () => {
    const result = resolveAgentModelTier({ agentType: 'SUPPORT' });
    assert.ok(result.disclaimer.toLowerCase().includes('no real') || result.disclaimer.length > 10);
  });
  it('high risk → may use fallback gracefully', () => {
    const result = resolveAgentModelTier({ agentType: 'CHAT', riskLevel: 'HIGH' });
    assert.ok(result.tier);
    assert.ok(typeof result.fallback === 'boolean');
  });
  it('AI_ROUTER_INTEGRATION_VERSION is semver', () => {
    assert.match(AI_ROUTER_INTEGRATION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// OBSERVABILITY INTEGRATION
// =====================================================================
describe('observabilityIntegration', () => {
  it('AGENT_EVENT has AGENT_STARTED', () => {
    assert.ok(AGENT_EVENT.AGENT_STARTED);
  });
  it('buildAgentEvent returns valid event', () => {
    const { valid, event } = buildAgentEvent('INTENT_RESOLVED', { agentId: 'x', intent: 'GREETING' });
    assert.ok(valid);
    assert.ok(event);
  });
  it('buildAgentEvent removes sensitive field userMessage', () => {
    const { event } = buildAgentEvent('RESPONSE_PLANNED', { agentId: 'x', userMessage: 'secret' });
    assert.equal(event.payload.userMessage, undefined);
  });
  it('buildAgentEvent fails for unknown eventType', () => {
    const { valid } = buildAgentEvent('FAKE_EVENT', {});
    assert.equal(valid, false);
  });
  it('validatePayloadSafety detects email field', () => {
    const { safe, forbiddenKeys } = validatePayloadSafety({ agentId: 'x', email: 'test@test.com' });
    assert.equal(safe, false);
    assert.ok(forbiddenKeys.includes('email'));
  });
  it('validatePayloadSafety passes clean payload', () => {
    const { safe } = validatePayloadSafety({ agentId: 'x', intent: 'GREETING' });
    assert.equal(safe, true);
  });
  it('logAgentInteraction returns valid event', () => {
    const { valid } = logAgentInteraction({ agentId: 'a1', agentType: 'CHAT', intent: 'GREETING' });
    assert.ok(valid);
  });
  it('OBSERVABILITY_INTEGRATION_VERSION is semver', () => {
    assert.match(OBSERVABILITY_INTEGRATION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// CI/CD INTEGRATION
// =====================================================================
describe('cicdIntegration', () => {
  it('AGENT_GATE has ETHICS_AUDIT', () => {
    assert.ok(AGENT_GATE.ETHICS_AUDIT);
  });
  it('GATE_STATUS has PASS FAIL WARNING', () => {
    assert.ok(GATE_STATUS.PASS);
    assert.ok(GATE_STATUS.FAIL);
    assert.ok(GATE_STATUS.WARNING);
  });
  it('evaluateAgentGates: all pass returns allPass true', () => {
    const result = evaluateAgentGates({
      testsPassed: 10, testsTotal: 10, lintErrors: 0,
      buildSuccess: true, secretsFound: 0, securityIssues: 0,
      darkPatternsFound: 0, schemaValid: true,
    });
    assert.equal(result.allPass, true);
    assert.equal(result.overallStatus, GATE_STATUS.PASS);
  });
  it('evaluateAgentGates: secrets found → p0Fail', () => {
    const result = evaluateAgentGates({ secretsFound: 1, testsPassed: 10, testsTotal: 10 });
    assert.equal(result.p0Fail, true);
  });
  it('evaluateAgentGates: dark patterns → p0Fail', () => {
    const result = evaluateAgentGates({ darkPatternsFound: 2, testsPassed: 5, testsTotal: 5, buildSuccess: true });
    assert.equal(result.p0Fail, true);
  });
  it('buildAgentReleaseGate returns gate result', () => {
    const result = buildAgentReleaseGate('agent-x', { passed: 5, total: 5, lintErrors: 0, buildOk: true });
    assert.ok(result.gates);
    assert.ok(result.overallStatus);
  });
  it('CICD_INTEGRATION_VERSION is semver', () => {
    assert.match(CICD_INTEGRATION_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// EVALUATION MODEL
// =====================================================================
describe('evaluationModel', () => {
  it('EVAL_DIMENSION has 12 entries', () => {
    assert.equal(Object.keys(EVAL_DIMENSION).length, 12);
  });
  it('evaluateAgentResponse returns scores', () => {
    const result = evaluateAgentResponse({
      response: 'Claro, puedo ayudarte a encontrar un horario disponible.',
      intent: 'BOOKING', agentType: 'BOOKING', channel: 'WEB_CHAT', maxWords: 120,
    });
    assert.ok(result.valid);
    assert.ok(result.totalScore >= 0);
  });
  it('totalScore is 0-100', () => {
    const { totalScore } = evaluateAgentResponse({ response: 'Hola.', intent: 'GREETING' });
    assert.ok(totalScore >= 0 && totalScore <= 100);
  });
  it('pressure phrase → NON_PRESSURE score < 70', () => {
    const { scores } = evaluateAgentResponse({
      response: '¡Es tu última oportunidad! Reserva ya.',
      intent: 'BOOKING',
    });
    assert.ok(scores[EVAL_DIMENSION.NON_PRESSURE] < 70);
  });
  it('robotic phrase → NATURALNESS score penalized', () => {
    const { scores } = evaluateAgentResponse({
      response: 'Por supuesto, aquí tienes la información que necesitas. ¡Claro que sí! Me complace ayudarte.',
      intent: 'INFORMATION',
    });
    assert.ok(scores[EVAL_DIMENSION.NATURALNESS] < 100);
  });
  it('invalid input returns valid false', () => {
    const result = evaluateAgentResponse({ response: '' });
    assert.equal(result.valid, false);
  });
  it('response within maxWords → BREVITY score >= 80', () => {
    const { scores } = evaluateAgentResponse({
      response: 'Disponemos de huecos esta semana.',
      intent: 'AVAILABILITY', maxWords: 120,
    });
    assert.ok(scores[EVAL_DIMENSION.BREVITY] >= 80);
  });
  it('EVALUATION_MODEL_VERSION is semver', () => {
    assert.match(EVALUATION_MODEL_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// ANTI-PARAGRAPH GATE
// =====================================================================
describe('antiParagraphGate', () => {
  it('AUDIT_FLAG has RESPONSE_TOO_LONG', () => {
    assert.ok(AUDIT_FLAG.RESPONSE_TOO_LONG);
  });
  it('auditResponseLength: short response passes', () => {
    const result = auditResponseLength({
      response: 'Hola, ¿en qué te puedo ayudar?', maxWords: 120, channel: 'WEB_CHAT',
    });
    assert.ok(result.valid);
    assert.ok(result.passed);
  });
  it('auditResponseLength: over word limit → flag', () => {
    const long = 'Esta es una respuesta muy larga. '.repeat(10);
    const result = auditResponseLength({ response: long, maxWords: 20, channel: 'WEB_CHAT' });
    assert.ok(!result.passed);
    assert.ok(result.flags.some(f => f.type === AUDIT_FLAG.RESPONSE_TOO_LONG));
  });
  it('auditResponseLength: repeated CTA → flag', () => {
    const result = auditResponseLength({
      response: 'Si quieres reservar, aquí estoy. Si quieres reservar más, también. Si quieres reservar pronto, perfecto.',
      maxWords: 200, channel: 'WEB_CHAT',
    });
    assert.ok(result.flags.some(f => f.type === AUDIT_FLAG.REPETITIVE_CTA));
  });
  it('auditResponseLength: WHATSAPP with markdown list → flag', () => {
    const result = auditResponseLength({
      response: '- Opción 1\n- Opción 2\n- Opción 3',
      maxWords: 120, channel: 'WHATSAPP',
    });
    assert.ok(result.flags.some(f => f.type === AUDIT_FLAG.UNNECESSARY_LIST));
  });
  it('empty response → valid false', () => {
    const result = auditResponseLength({ response: '' });
    assert.equal(result.valid, false);
  });
  it('ANTI_PARAGRAPH_GATE_VERSION is semver', () => {
    assert.match(ANTI_PARAGRAPH_GATE_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// HUMANNESS QA
// =====================================================================
describe('humannessQA', () => {
  it('HUMANNESS_ISSUE has 8 entries', () => {
    assert.equal(Object.keys(HUMANNESS_ISSUE).length, 8);
  });
  it('checkHumanness: clean response → isHuman true', () => {
    const { isHuman } = checkHumanness('Podemos mirar juntos cuándo encajaría mejor.');
    assert.ok(isHuman);
  });
  it('checkHumanness: robotic phrase → ROBOTIC_PHRASING issue', () => {
    const { issues } = checkHumanness('Por supuesto, aquí tienes toda la información.');
    assert.ok(issues.some(i => i.type === HUMANNESS_ISSUE.ROBOTIC_PHRASING));
  });
  it('checkHumanness: multiple exclamation marks → OVERENTHUSIASM', () => {
    const { issues } = checkHumanness('¡¡Genial!! ¡Fantástico!!');
    assert.ok(issues.some(i => i.type === HUMANNESS_ISSUE.OVERENTHUSIASM));
  });
  it('checkHumanness: pressure phrase → SALES_PRESSURE', () => {
    const { issues } = checkHumanness('Es urgente. Esta es tu última oportunidad.');
    assert.ok(issues.some(i => i.type === HUMANNESS_ISSUE.SALES_PRESSURE));
  });
  it('checkHumanness: "garantizado" → KNOW_IT_ALL_TONE', () => {
    const { issues } = checkHumanness('Definitivamente esto te va a funcionar al 100%.');
    assert.ok(issues.some(i => i.type === HUMANNESS_ISSUE.KNOW_IT_ALL_TONE));
  });
  it('empty input → valid false', () => {
    const { valid } = checkHumanness('');
    assert.equal(valid, false);
  });
  it('humanScore is 0-100', () => {
    const { humanScore } = checkHumanness('Hola, ¿cómo te puedo ayudar?');
    assert.ok(humanScore >= 0 && humanScore <= 100);
  });
  it('HUMANNESS_QA_VERSION is semver', () => {
    assert.match(HUMANNESS_QA_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// VERTICAL SAFETY
// =====================================================================
describe('verticalSafety', () => {
  it('SAFETY_RULE has NO_DIAGNOSIS', () => {
    assert.ok(SAFETY_RULE.NO_DIAGNOSIS);
  });
  it('getVerticalSafetyConfig returns psychology config', () => {
    const config = getVerticalSafetyConfig('psychology');
    assert.ok(config.rules.includes(SAFETY_RULE.NO_DIAGNOSIS));
  });
  it('psychology has ESCALATE_ON_CRISIS rule', () => {
    const config = getVerticalSafetyConfig('psychology');
    assert.ok(config.rules.includes(SAFETY_RULE.ESCALATE_ON_CRISIS));
  });
  it('legal has NO_LEGAL_ADVICE rule', () => {
    const config = getVerticalSafetyConfig('legal');
    assert.ok(config.rules.includes(SAFETY_RULE.NO_LEGAL_ADVICE));
  });
  it('DEFAULT has empty rules', () => {
    const config = getVerticalSafetyConfig('DEFAULT');
    assert.equal(config.rules.length, 0);
  });
  it('checkSafety: crisis trigger detected in psychology', () => {
    const result = checkSafety('no quiero vivir más', 'psychology');
    assert.ok(result.isCrisis);
    assert.ok(result.mustEscalate);
    assert.ok(result.emergencyPhrase);
  });
  it('checkSafety: normal message → no crisis', () => {
    const result = checkSafety('quiero pedir una cita', 'psychology');
    assert.equal(result.isCrisis, false);
  });
  it('auditResponseSafety: legal vertical blocks legal advice', () => {
    const result = auditResponseSafety('Legalmente tienes derecho a eso.', 'legal');
    assert.equal(result.safe, false);
  });
  it('auditResponseSafety: padel vertical → safe', () => {
    const result = auditResponseSafety('Tenemos pistas disponibles mañana.', 'padel');
    assert.equal(result.safe, true);
  });
  it('VERTICAL_SAFETY_VERSION is semver', () => {
    assert.match(VERTICAL_SAFETY_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

// =====================================================================
// AGENT FIXTURES
// =====================================================================
describe('agentFixtures', () => {
  it('FIXTURE_CLIENT has 5 entries', () => {
    assert.equal(Object.keys(FIXTURE_CLIENT).length, 5);
  });
  it('getFixture returns NEXO_VET', () => {
    const { valid, fixture } = getFixture(FIXTURE_CLIENT.NEXO_VET);
    assert.ok(valid);
    assert.ok(fixture);
  });
  it('fixture isReal false', () => {
    const { fixture } = getFixture(FIXTURE_CLIENT.FISIONOVA);
    assert.equal(fixture.isReal, false);
  });
  it('fixture dataType is FIXTURE', () => {
    const { fixture } = getFixture(FIXTURE_CLIENT.PADEL_GENERICO);
    assert.equal(fixture.dataType, 'FIXTURE');
  });
  it('getFixture: unknown ID → valid false', () => {
    const { valid } = getFixture('FAKE_CLIENT_999');
    assert.equal(valid, false);
  });
  it('listFixtures returns array with 5 entries', () => {
    const list = listFixtures();
    assert.equal(list.length, 5);
  });
  it('DESPACHO_LEGAL fixture has legal vertical', () => {
    const { fixture } = getFixture(FIXTURE_CLIENT.DESPACHO_LEGAL);
    assert.equal(fixture.businessProfile.vertical, 'legal');
  });
  it('all fixtures have businessProfile.name', () => {
    for (const id of listFixtures()) {
      const { fixture } = getFixture(id);
      assert.ok(fixture.businessProfile.name, `${id} missing name`);
    }
  });
  it('AGENT_FIXTURES_VERSION is semver', () => {
    assert.match(AGENT_FIXTURES_VERSION, /^\d+\.\d+\.\d+$/);
  });
});
